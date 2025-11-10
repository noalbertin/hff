import React, { useState, useRef, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Box,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import PaginationComponent from './PaginationComponent'
import BpCheckbox from './BpCheckbox'

export function highlightText(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span
        key={index}
        style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}
      >
        {part}
      </span>
    ) : (
      part
    )
  )
}

function TableView({
  data,
  columns,
  rowsPerPage,
  onEdit,
  onDelete,
  onView,
  userRole, // ✅ Nouvelle prop pour le rôle utilisateur
  showCheckboxes = true,
  showDeleteIcon = true,
  showEditIcon = true,
  showActions = true,
  showViewIcon = true,
}) {
  // ✅ Déterminer les permissions basées sur le rôle
  const isAdmin = userRole === 'admin'
  const canEdit = isAdmin
  const canDelete = isAdmin
  const canSelectMultiple = isAdmin

  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('id')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const tableContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    const handleMouseDown = (e) => {
      setIsDragging(true)
      setStartX(e.pageX - container.offsetLeft)
      setScrollLeft(container.scrollLeft)
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
    }

    const handleMouseLeave = () => {
      setIsDragging(false)
      container.style.cursor = 'grab'
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      container.style.cursor = 'grab'
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isDragging, startX, scrollLeft])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1)
  }

  const handleSelectAllClick = (event) => {
    if (!canSelectMultiple) return // ✅ Bloquer si pas admin
    if (event.target.checked) {
      const newSelecteds = data.map((item) => item.id)
      setSelected(newSelecteds)
    } else {
      setSelected([])
    }
  }

  const handleCheckboxChange = (event, id) => {
    if (!canSelectMultiple) return // ✅ Bloquer si pas admin
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  const sortedData = [...data].sort(getComparator(order, orderBy))

  const filteredData = sortedData.filter((item) => {
    if (
      searchQuery &&
      !item.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const handleDeleteSelected = () => {
    if (!canDelete) return // ✅ Bloquer si pas admin
    onDelete(selected)
    setSelected([])
  }

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // ✅ Afficher les actions seulement si l'utilisateur a des permissions
  const shouldShowActions =
    showActions && (canEdit || canDelete || showViewIcon)

  return (
    <Box
      sx={{
        border: '1px solid rgba(224, 224, 224, .6)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header personnalisé pour les éléments sélectionnés - Seulement pour admin */}
      {canSelectMultiple && selected.length > 0 && (
        <div
          style={{
            backgroundColor: '#d5edf3',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#078DEE',
            fontWeight: '600',
          }}
        >
          <div>
            <BpCheckbox
              indeterminate={
                selected.length > 0 && selected.length < filteredData.length
              }
              checked={selected.length === filteredData.length}
              onChange={handleSelectAllClick}
            />
            <span>{selected.length} sélectionné(s)</span>
          </div>
          <IconButton
            sx={{ marginRight: '8px' }}
            onClick={handleDeleteSelected}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )}

      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
          overflowX: 'auto',
          cursor: 'grab',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
          },
        }}
      >
        <Table stickyHeader sx={{ minWidth: 'max-content' }}>
          <TableHead>
            <TableRow>
              {/* ✅ Checkboxes seulement pour admin */}
              {showCheckboxes && canSelectMultiple && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    color: '#637381',
                    fontWeight: '800',
                    borderBottom: '1px dashed #e0e0e0 !important',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                  }}
                >
                  <BpCheckbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < filteredData.length
                    }
                    checked={selected.length === filteredData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{
                    color: '#637381',
                    fontWeight: '800',
                    borderBottom: '1px dashed #e0e0e0 !important',
                    backgroundColor: '#f5f5f5',
                    whiteSpace: 'nowrap',
                    minWidth: '150px',
                  }}
                  className={
                    column.id === 'experience' ||
                    column.id === 'permis_conduire'
                      ? 'text-center'
                      : ''
                  }
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              {shouldShowActions && (
                <TableCell
                  className="text-end"
                  sx={{
                    color: '#637381',
                    fontWeight: '800',
                    paddingRight: '30px',
                    backgroundColor: '#f5f5f5',
                    borderBottom: '1px dashed #e0e0e0 !important',
                    position: 'sticky',
                    right: 0,
                    zIndex: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const isItemSelected = selected.indexOf(row.id) !== -1
              return (
                <TableRow
                  key={row.id}
                  selected={isItemSelected}
                  style={{
                    backgroundColor: isItemSelected
                      ? 'rgba(3, 81, 171, 0.04)'
                      : 'inherit',
                  }}
                >
                  {/* ✅ Checkboxes seulement pour admin */}
                  {showCheckboxes && canSelectMultiple && (
                    <TableCell
                      sx={{
                        borderBottom: '1px dashed #e0e0e0 !important',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: isItemSelected
                          ? 'rgba(3, 81, 171, 0.04)'
                          : '#fff',
                        zIndex: 2,
                      }}
                      padding="checkbox"
                    >
                      <BpCheckbox
                        checked={isItemSelected}
                        onChange={(event) =>
                          handleCheckboxChange(event, row.id)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      sx={{
                        borderBottom: '1px dashed #e0e0e0 !important',
                        whiteSpace: 'nowrap',
                        minWidth: '150px',
                      }}
                      key={column.id}
                    >
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                  {shouldShowActions && (
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: '1px dashed #e0e0e0 !important',
                        position: 'sticky',
                        right: 0,
                        backgroundColor: isItemSelected
                          ? 'rgba(3, 81, 171, 0.04)'
                          : '#fff',
                        zIndex: 2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {/* ✅ Icône Voir - Toujours visible */}
                      {showViewIcon && onView && (
                        <IconButton onClick={() => onView(row)}>
                          <VisibilityIcon color="info" />
                        </IconButton>
                      )}

                      {/* ✅ Icône Edit - Seulement pour admin */}
                      {showEditIcon && canEdit && (
                        <IconButton onClick={() => onEdit(row)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      )}

                      {/* ✅ Icône Delete - Seulement pour admin */}
                      {showDeleteIcon && canDelete && (
                        <IconButton onClick={() => onDelete(row)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationComponent
        count={Math.ceil(filteredData.length / rowsPerPage)}
        page={page + 1}
        onChange={handleChangePage}
      />
    </Box>
  )
}

export default TableView
