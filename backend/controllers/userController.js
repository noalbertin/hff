// controllers/userController.js
import bcrypt from 'bcryptjs'
import db from '../db.js'

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id_user, nom_user, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(users)
  } catch (err) {
    console.error(
      'Erreur lors de la récupération des utilisateurs:',
      err.message
    )
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const [users] = await db.query(
      'SELECT id_user, nom_user, role, created_at FROM users WHERE id_user = ?',
      [id]
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

export const createUser = async (req, res) => {
  try {
    const { nom_user, password, role } = req.body

    // Validation
    if (!nom_user || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur et mot de passe requis" })
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
      [nom_user, hashedPassword, role || 'visiteur']
    )

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      id_user: result.insertId,
      nom_user,
      role: role || 'visiteur',
    })
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err.message)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Delete user (sans middleware d'authentification)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier si l'utilisateur existe
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE id_user = ?',
      [id]
    )

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Supprimer l'utilisateur
    await db.query('DELETE FROM users WHERE id_user = ?', [id])

    res.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (err) {
    console.error(
      "Erreur lors de la suppression de l'utilisateur:",
      err.message
    )
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Update user (sans middleware d'authentification)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { nom_user, password, role } = req.body

    // Vérifier si l'utilisateur existe
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE id_user = ?',
      [id]
    )

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifier si le nom d'utilisateur est déjà pris par un autre utilisateur
    if (nom_user) {
      const [duplicateUser] = await db.query(
        'SELECT * FROM users WHERE nom_user = ? AND id_user != ?',
        [nom_user, id]
      )

      if (duplicateUser.length > 0) {
        return res
          .status(400)
          .json({ error: "Ce nom d'utilisateur est déjà pris" })
      }
    }

    // Construire la requête de mise à jour
    let updateQuery = 'UPDATE users SET '
    const updateValues = []
    const updateFields = []

    if (nom_user) {
      updateFields.push('nom_user = ?')
      updateValues.push(nom_user)
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateFields.push('password = ?')
      updateValues.push(hashedPassword)
    }

    if (role) {
      updateFields.push('role = ?')
      updateValues.push(role)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' })
    }

    updateQuery += updateFields.join(', ') + ' WHERE id_user = ?'
    updateValues.push(id)

    await db.query(updateQuery, updateValues)

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await db.query(
      'SELECT id_user, nom_user, role, created_at FROM users WHERE id_user = ?',
      [id]
    )

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser[0],
    })
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de l'utilisateur:",
      err.message
    )
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
