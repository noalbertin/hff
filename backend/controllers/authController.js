// controllers/authController.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt'
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret'

// Register
export const register = async (req, res) => {
  try {
    const { nom_user, password, password2, recaptchaToken } = req.body

    if (!nom_user || !password || !password2) {
      return res.status(400).json({ error: 'Tous les champs sont requis' })
    }

    if (password !== password2) {
      return res
        .status(400)
        .json({ error: 'Les mots de passe ne correspondent pas' })
    }

    // Vérifier reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Vérification reCAPTCHA requise' })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    try {
      const recaptchaResponse = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${secretKey}&response=${recaptchaToken}`,
        }
      )

      const recaptchaData = await recaptchaResponse.json()

      if (!recaptchaData.success) {
        console.error('Échec reCAPTCHA:', recaptchaData['error-codes'])
        return res.status(400).json({
          error: 'Échec de la vérification reCAPTCHA. Veuillez réessayer.',
        })
      }
    } catch (recaptchaError) {
      console.error('Erreur lors de la vérification reCAPTCHA:', recaptchaError)
      return res.status(500).json({
        error: 'Erreur lors de la vérification reCAPTCHA',
      })
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE nom_user = ?',
      [nom_user]
    )

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Cet utilisateur existe déjà' })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insérer l'utilisateur
    const [result] = await db.query(
      'INSERT INTO users (nom_user, password, role) VALUES (?, ?, ?)',
      [nom_user, hashedPassword, 'visiteur']
    )

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      id_user: result.insertId,
      nom_user,
      role: 'visiteur',
    })
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err.message)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Login (Token)
export const login = async (req, res) => {
  try {
    const { nom_user, password } = req.body

    if (!nom_user || !password) {
      return res
        .status(400)
        .json({ detail: "Nom d'utilisateur et mot de passe requis" })
    }

    // Trouver l'utilisateur
    const [users] = await db.query('SELECT * FROM users WHERE nom_user = ?', [
      nom_user,
    ])

    if (users.length === 0) {
      return res.status(401).json({ detail: 'Identifiants incorrects' })
    }

    const user = users[0]

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ detail: 'Identifiants incorrects' })
    }

    // Créer les tokens
    const accessToken = jwt.sign(
      {
        id_user: user.id_user,
        nom_user: user.nom_user,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const refreshToken = jwt.sign(
      {
        id_user: user.id_user,
        nom_user: user.nom_user,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      access: accessToken,
      refresh: refreshToken,
    })
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message)
    res.status(500).json({ detail: 'Erreur serveur' })
  }
}

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refresh } = req.body

    if (!refresh) {
      return res.status(400).json({ detail: 'Refresh token requis' })
    }

    jwt.verify(refresh, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ detail: 'Refresh token invalide' })
      }

      // Récupérer le rôle actuel de l'utilisateur
      const [users] = await db.query(
        'SELECT role FROM users WHERE id_user = ?',
        [decoded.id_user]
      )

      const role = users.length > 0 ? users[0].role : 'visiteur'

      const accessToken = jwt.sign(
        {
          id_user: decoded.id_user,
          nom_user: decoded.nom_user,
          role: role,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      res.json({
        access: accessToken,
        refresh: refresh,
      })
    })
  } catch (err) {
    console.error('Erreur lors du rafraîchissement du token:', err.message)
    res.status(500).json({ detail: 'Erreur serveur' })
  }
}

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id_user, nom_user, role, created_at FROM users WHERE id_user = ?',
      [req.user.id_user]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(users[0])
  } catch (err) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur:",
      err.message
    )
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
