import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Signup, Signin, Home, Dashboard } from "./pages/";
import { AuthLayout } from "./components/";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index
        element={
          <AuthLayout authenicated={false}>
            <Home />
          </AuthLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthLayout authenicated={false}>
            <Signup />
          </AuthLayout>
        }
      />
      <Route
        path="/signin"
        element={
          <AuthLayout authenicated={false}>
            <Signin />
          </AuthLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthLayout authenicated={true}>
            <Dashboard />
          </AuthLayout>
        }
      />
    </Route>
  )
);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
