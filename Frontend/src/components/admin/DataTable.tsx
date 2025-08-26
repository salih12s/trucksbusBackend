import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Skeleton,
  Typography,
  Alert,
  Button
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

export interface DataTableColumn<T = any> {
  id: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  sort?: string;
  order?: 'asc' | 'desc';
  loading?: boolean;
  error?: Error | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void;
  onRetry?: () => void;
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
}

const DataTable = <T extends Record<string, any>>({
  columns,
  rows,
  page,
  pageSize,
  totalCount,
  sort,
  order = 'asc',
  loading = false,
  error = null,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRetry,
  emptyMessage = 'Kayıt bulunamadı',
  rowsPerPageOptions = [5, 10, 25, 50]
}: DataTableProps<T>) => {
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    
    const isAsc = sort === columnId && order === 'asc';
    onSortChange(columnId, isAsc ? 'desc' : 'asc');
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  // Error state
  if (error && !loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Tekrar Dene
              </Button>
            )
          }
        >
          {error.message || 'Veri yüklenirken hata oluştu'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={sort === column.id ? order : false}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sort === column.id}
                      direction={sort === column.id ? order : 'asc'}
                      onClick={() => handleSort(String(column.id))}
                    >
                      {column.label}
                      {sort === column.id && (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      )}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      <Skeleton animation="wave" height={40} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !rows || rows.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              (rows || []).map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || 'left'}
                      >
                        {column.render ? column.render(value, row, index) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!loading && rows.length > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `${to}'dan fazla`}`
          }
        />
      )}
    </Paper>
  );
};

export default DataTable;
