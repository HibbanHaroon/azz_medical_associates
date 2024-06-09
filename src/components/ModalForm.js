import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
};

const ModalForm = ({
  open,
  handleClose,
  mode,
  type,
  onSubmit,
  selectedUser,
}) => {
  const isDoctor = type === "doctor";
  const [formData, setFormData] = useState({
    name: "",
    domain: isDoctor ? "" : undefined,
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && selectedUser) {
      setFormData({
        name: selectedUser.name || "",
        domain: isDoctor ? selectedUser.domain || "" : undefined,
        email: selectedUser.email || "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        domain: isDoctor ? "" : undefined,
        email: "",
        password: "",
      });
    }
  }, [mode, selectedUser, isDoctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (isDoctor && !formData.domain) {
      newErrors.domain = "Professional domain is required";
    }
    if (mode === "add" && !formData.email) {
      newErrors.email = "Email is required";
    }
    if (mode === "add" && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const userData = { ...formData };
      onSubmit(userData);
      setFormData({
        name: "",
        domain: isDoctor ? "" : undefined,
        email: "",
        password: "",
      });
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {mode === "add"
            ? `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`
            : `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
          onSubmit={handleSubmit}
        >
          <TextField
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          {isDoctor && (
            <TextField
              required
              fullWidth
              id="domain"
              label="Professional Domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              error={!!errors.domain}
              helperText={errors.domain}
            />
          )}
          {mode === "add" && (
            <>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleClose} variant="outlined" color="error">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalForm;
