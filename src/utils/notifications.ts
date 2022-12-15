import toast from "react-hot-toast";

export const notifySuccessBR = (msg: string) =>
  toast.success(msg, {
    duration: 6500,
    position: "bottom-right",
    style: { fontSize: "0.9rem" },
  });

export const notifyError = (err: string) =>
  toast.error(err, {
    duration: 12000,
    position: "bottom-right",
    style: { fontSize: "0.85rem" /* marginTop: '44px'  */ },
  });

// duration'i cok yuksek bir rakama ayarlayip
// show bool degeri belli bir state'te bagli olarak useEffect icinde kullanilabilir.
// Deger false'a dondugunde kapaniyor
export const notifySuccessTC = (err: string, show: boolean) => {
  const toastId = toast.success(err, {
    duration: 4000,
    position: "top-center",

    style: {
      fontSize: "0.85rem",
      marginTop: "10px",
      minWidth: "250px",
      border: "1px solid rgb(124 58 237 / var(--tw-bg-opacity))",
    },
  });

  if (!show) toast.dismiss(toastId);
};
