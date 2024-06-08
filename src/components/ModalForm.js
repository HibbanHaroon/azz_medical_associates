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
  selectedClinic,
}) => {
  const isDoctor = type === "doctor";

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && selectedClinic) {
      setFormData({
        name: selectedClinic.name || "",
        domain: selectedClinic.domain || "",
      });
    } else {
      setFormData({
        name: "",
        domain: "",
        email: "",
        password: "",
      });
    }
  }, [mode, selectedClinic]);

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
    if (mode === "add" && isDoctor && !formData.email) {
      newErrors.email = "Email is required";
    }
    if (mode === "add" && isDoctor && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const doctorData = { ...formData };
      onSubmit(doctorData);
      setFormData({
        name: "",
        domain: "",
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
            ? `Add ${isDoctor ? "Doctor" : "Clinic"}`
            : `Edit ${isDoctor ? "Doctor" : "Clinic"}`}
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
            label={isDoctor ? "Doctor Name" : "Clinic Name"}
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          {isDoctor && (
            <>
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
