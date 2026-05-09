import { useState } from "react";
import HomeScreen from "./src/screens/homescreen";
import GymScreen from "./src/screens/gymscreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");

  if (currentScreen === "gym") {
    return <GymScreen onGoToHome={() => setCurrentScreen("home")} />;
  }

  return <HomeScreen onGoToGym={() => setCurrentScreen("gym")} />;
}
