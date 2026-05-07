import { useState } from "react";
import LoginScreen from "./src/screens/loginscreen";
import RegisterScreen from "./src/screens/registerscreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");

  if (currentScreen === "register") {
    return <RegisterScreen onGoToLogin={() => setCurrentScreen("login")} />;
  }

  return <LoginScreen onGoToRegister={() => setCurrentScreen("register")} />;
}
