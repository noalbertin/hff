import React from 'react'
import { TextField, Autocomplete } from '@mui/material'

const AutocompleteField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
  fullWidth = true,
  ...props
}) => {
  // Détermine si les options sont des objets ou des strings
  const isObjectOptions = options.length > 0 && typeof options[0] === 'object'

  // ✅ FIX : Gérer correctement quand value est déjà un objet OU juste un ID
  const selectedOption = isObjectOptions
    ? typeof value === 'object' && value !== null
      ? value // ✅ value est déjà l'objet complet
      : options.find((opt) => opt.value === value) || null // ✅ value est un ID
    : value || null

  const handleChange = (event, newValue) => {
    const selectedValue = isObjectOptions ? newValue?.value : newValue
    onChange({
      target: {
        name: name,
        value: selectedValue || '', // ⚠️ Peut causer un problème : '' vs null
      },
    })
  }

  return (
    <Autocomplete
      fullWidth={fullWidth}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) =>
        isObjectOptions ? option?.label || '' : option
      } // ✅ Ajout de gestion null
      isOptionEqualToValue={(option, value) =>
        isObjectOptions ? option.value === value?.value : option === value
      }
      noOptionsText="Aucun résultat"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: 'rgba(145, 158, 171, 0.16)',
              },
              '&:hover fieldset': {
                borderColor: '#1C252E',
                borderWidth: '1px',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1C252E',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 'inherit',
              color: '#919EAB',
              '&.Mui-focused': {
                fontWeight: 'bold',
                color: '#1C252E',
              },
            },
          }}
        />
      )}
      ListboxProps={{
        sx: {
          boxShadow:
            'rgba(145, 158, 171, 0.24) 0px 0px 2px 0px, rgba(145, 158, 171, 0.24) -20px 20px 40px -4px',
          maxHeight: '240px',
          borderRadius: '10px',
          padding: '6px 8px',
          color: '#1C252E',
          '& .MuiAutocomplete-option': {
            borderRadius: '10px',
            margin: '4px 0',
          },
        },
      }}
      {...props}
    />
  )
}

export default AutocompleteField
