import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import Cookies from "js-cookie";

const InitialForm = {
  amount: 0,
  description: "",
  date: new Date(),
  category_id: "",
};

export default function TransactionForm({
  fetchTransactions,
  editTransaction,
  setEditTransaction,
}) {
  const user = useSelector((state) => state.auth.user);
  const categories = user?.categories || [];
  const token = Cookies.get("token");
  const [form, setForm] = useState(InitialForm);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (editTransaction.amount !== undefined) {
      setForm(editTransaction);
      setEditMode(true);
    } else {
      setForm(InitialForm);
      setEditMode(false);
    }
  }, [editTransaction]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleDate(newValue) {
    setForm({ ...form, date: newValue });
  }

  function handleSubmit(e) {
    e.preventDefault();
    editMode ? update() : create();
  }

  function handleCancel() {
    setForm(InitialForm);
    setEditMode(false);
    setEditTransaction({});
  }

  function reload(res) {
    if (res.ok) {
      setForm(InitialForm);
      setEditMode(false);
      setEditTransaction({});
      fetchTransactions();
    }
  }

  async function create() {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    reload(res);
  }

  async function update() {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/transaction/${editTransaction._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    reload(res);
  }

  function getCategoryNameById() {
    return (
      categories.find((category) => category._id === form.category_id) ?? null
    );
  }

  return (
    <Card
      sx={{ minWidth: 275, marginTop: 10, width: { xs: "100%", sm: "auto" } }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          {editMode ? "Update Transaction" : "Add New Transaction"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            type="number"
            sx={{ mr: { sm: 5 }, width: { xs: "100%", sm: "auto" } }}
            id="outlined-basic"
            label="Amount (in EUR)"
            name="amount"
            variant="outlined"
            size="small"
            value={form.amount}
            onChange={handleChange}
          />
          <TextField
            type="text"
            sx={{ mr: { sm: 5 }, width: { xs: "100%", sm: "auto" } }}
            id="outlined-basic"
            label="Description"
            name="description"
            variant="outlined"
            size="small"
            value={form.description}
            onChange={handleChange}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Transaction Date"
              inputFormat="DD.MM.YYYY"
              value={form.date}
              onChange={handleDate}
              renderInput={(params) => (
                <TextField
                  sx={{ mr: { sm: 5 }, width: { xs: "100%", sm: "auto" } }}
                  size="small"
                  {...params}
                />
              )}
            />
          </LocalizationProvider>
          <Autocomplete
            value={getCategoryNameById()}
            onChange={(event, newValue) => {
              const newCategoryId = newValue ? newValue._id : "";
              setForm({ ...form, category_id: newCategoryId });
            }}
            id="controllable-states-demo"
            options={categories}
            getOptionLabel={(option) => option.label ?? ""}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
            noOptionsText="No categories"
            sx={{ width: { xs: "100%", sm: 200 }, mr: { sm: 5 } }}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Category" />
            )}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {editMode ? (
              <>
                <Button
                  type="submit"
                  color="success"
                  variant="outlined"
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Update
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                color="success"
                variant="contained"
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
