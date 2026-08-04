import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import store from "./store/store.js";
import { fetchMe, selectToken } from "./store/authSlice.js";
import "./index.css";

function Bootstrap({ children }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  return children;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Bootstrap>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }}
        />
        <App />
      </Bootstrap>
    </Provider>
  </StrictMode>,
);
