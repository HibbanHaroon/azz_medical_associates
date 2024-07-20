import toast from "react-hot-toast";

const showInfoToast = (msg) =>
  toast(msg, {
    icon: "ℹ️",
    style: {
      padding: "16px",
    },
    duration: 3500,
  });

export default showInfoToast;
