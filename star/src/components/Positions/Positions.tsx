/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, ChangeEvent, FormEvent } from "react";
import { Building2, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
} from "@mui/material";
import { usePositions } from "./hooks/usePositions";
import AdminOnly from "../ui/AdminOnly";

const Positions: React.FC = () => {
  const {
    positions,
    companies,
    loading,
    error: apiError,
    createPosition,
    updatePosition,
    deletePosition,
  } = usePositions();

  const [formData, setFormData] = useState<{ title: string; companyId: number }>({
    title: "",
    companyId: 0,
  });
  const [editingPosition, setEditingPosition] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [formError, setFormError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "companyId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.title) {
      setFormError("Please enter a title and select a company.");
      return;
    }

    try {
      if (editingPosition) {
        await updatePosition(editingPosition, formData);
      } else {
        await createPosition(formData);
      }
      setFormData({ title: "", companyId: 0 });
      setEditingPosition(null);
      setFormError("");
    } catch (err) {
      setFormError("Failed to save position.");
    }
  };

  const handleEdit = (position: { id: number; title: string; companyId: number }) => {
    setEditingPosition(position.id);
    setFormData({
      title: position.title,
      companyId: position.companyId,
    });
    setFormError("");
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate the rows to display based on pagination
  const paginatedPositions = positions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <AdminOnly>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            {editingPosition ? "Edit Position" : "Add Position"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingPosition ? "Update" : "Submit"}
            </button>
          </div>
          {(formError || apiError) && (
            <p className="text-red-500 text-center my-2">{formError || apiError}</p>
          )}
        </form>

        <div>
          <h3 className="text-lg font-semibold mb-4">Positions & Companies</h3>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="positions table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Position Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>{position.id}</TableCell>
                      <TableCell>{position.title}</TableCell>
                      <TableCell>{position.company?.name ?? "Unknown"}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleEdit(position)}
                          color="primary"
                          startIcon={<Edit />}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deletePosition(position.id)}
                          color="error"
                          startIcon={<Trash2 />}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={positions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </div>
      </div>
    </AdminOnly>
  );
};

export default Positions; 