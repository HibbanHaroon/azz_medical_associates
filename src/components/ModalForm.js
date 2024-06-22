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
  const isClinic = type === "clinic";
  const isDoctor = type === "doctor";

  const initialFormData = {
    name: "",
    ...(isDoctor && { domain: "", roomNumber: "" }),
    ...(mode === "add" && !isClinic && { email: "", password: "" }),
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && selectedUser) {
      setFormData({
        name: selectedUser.name || "",
        ...(isDoctor && {
          domain: selectedUser.domain || "",
          roomNumber: selectedUser.roomNumber || "",
        }),
        ...(mode === "add" && !isClinic && { email: "", password: "" }),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [mode, selectedUser, isDoctor, isClinic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
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
    if (isDoctor && !formData.roomNumber) {
      newErrors.roomNumber = "Room Number is required";
    }
    if (mode === "add" && !isClinic && !formData.email) {
      newErrors.email = "Email is required";
    }
    if (mode === "add" && !isClinic && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const userData = { name: formData.name };
      if (isDoctor) {
        userData.domain = formData.domain;
        userData.roomNumber = formData.roomNumber;
      }

      if (!isClinic) {
        if (mode === "add") {
          userData.email = formData.email;
          userData.password = formData.password;
        } else {
          userData.email = formData.email;
        }
      }
      onSubmit(userData);
      setFormData(initialFormData);
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
              <TextField
                required
                fullWidth
                id="roomNumber"
                label="Room Number"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                error={!!errors.roomNumber}
                helperText={errors.roomNumber}
              />
            </>
          )}
          {!isClinic && mode === "add" && (
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
