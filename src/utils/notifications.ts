import toast from "react-hot-toast";

export const notifySuccess = (msg: string) =>
  toast.success(msg, {
    duration: 5500,
    position: "bottom-right",
    style: { fontSize: "0.9rem" },
  });

export const notifyError = (err: string) =>
  toast.error(err, {
    duration: 10000,
    position: "bottom-right",
    style: { fontSize: "0.85rem" /* marginTop: '44px'  */ },
  });

export const notifyOwner = (err: string, show: boolean) => {
  const toastId = toast.success(err, {
    duration: 100000,
    position: "top-center",

    style: {
      fontSize: "0.85rem",
      marginTop: "10px",
      // minWidth: '100%',
      // position: 'absolute',
      // inset: '0',
      // top: '250px',
      // zIndex: 999999
    },
  });

  if (!show) toast.dismiss(toastId);
};
