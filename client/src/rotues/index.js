import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import CheckPasswordPage from "../pages/CheckPasswordPage";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";
import AuthLayouts from "../layout";
import Forgotpassword from "../pages/Forgotpassword";
import ProtectedRoutes from "../components/ProtectedRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "email",
        element: <CheckEmailPage />,
      },
      {
        path: "password",

        element: <CheckPasswordPage />,
      },
      {
        path: "forgot-password",
        element: (
          <AuthLayouts>
            <Forgotpassword />
          </AuthLayouts>
        ),
      },
      {
        path: "",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
        children: [
          {
            path: ":userId",
            element: (
              <ProtectedRoutes>
                <MessagePage />
              </ProtectedRoutes>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
