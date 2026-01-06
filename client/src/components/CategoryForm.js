import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import Cookies from "js-cookie";
import { setUser } from "../store/auth";

const InitialForm = {
  label: "",
  icon: "",
};

const icons = ["🚗", "🛒", "🧾", "📈"];

export default function CategoryForm({ editCategory, setEditCategory }) {
  const user = useSelector((state) => state.auth.user);
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const [form, setForm] = useState(InitialForm);
  const [editMode, setEditMode] = useState(false);
  const categories = user?.categories ?? [];

  useEffect(() => {
    if (editCategory._id !== undefined) {
      setForm(editCategory);
      setEditMode(true);
    } else {
      setForm(InitialForm);
      setEditMode(false);
    }
  }, [editCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    editMode ? update() : create();
  }

  function handleCancel() {
    setForm(InitialForm);
    setEditMode(false);
    setEditCategory({});
  }

  function reload(res, _user) {
    if (res.ok) {
      setForm(InitialForm);
      setEditMode(false);
      setEditCategory({});
      dispatch(setUser({ user: _user }));
    }
  }

  async function create() {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/category`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const _user = {
      ...(user ?? {}),
      categories: [...categories, { ...form }],
    };
    reload(res, _user);
  }

  async function update() {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/category/${editCategory._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const _user = {
      ...(user ?? {}),
      categories: categories.map((cat) =>
        cat._id === editCategory._id ? form : cat
      ),
    };
    reload(res, _user);
  }

  function getCategoryNameById() {
    return (
      user?.categories?.find((category) => category._id === form.category_id) ??
      null
    );
  }

  return (
    <Card
      sx={{ minWidth: 275, marginTop: 10, width: { xs: "100%", sm: "auto" } }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Add New Category
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
            type="text"
            sx={{ mr: { sm: 5 }, width: { xs: "100%", sm: "auto" } }}
            id="outlined-basic"
            label="Label"
            name="label"
            variant="outlined"
            size="small"
            value={form.label}
            onChange={handleChange}
          />
          <Autocomplete
            value={getCategoryNameById()}
            onChange={(event, newValue) => {
              setForm({ ...form, icon: newValue });
            }}
            id="icons"
            options={icons}
            sx={{ width: { xs: "100%", sm: 200 }, mr: { sm: 5 } }}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Icon" />
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
