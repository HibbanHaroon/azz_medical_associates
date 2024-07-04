import toast from "react-hot-toast";

const showErrorToast = (msg) =>
  toast.error(msg, {
    style: {
      padding: "16px",
    },
    duration: 3500,
  });

export default showErrorToast;
