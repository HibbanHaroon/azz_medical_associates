import toast from "react-hot-toast";

const showSuccessToast = (msg) =>
  toast.success(msg, {
    style: {
      padding: "16px",
    },
    duration: 3500,
  });

export default showSuccessToast;
