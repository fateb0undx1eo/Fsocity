import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";
import PublicNav from "../components/PublicNav";
import { PricingSection } from "./LandingPage";

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#060608",
        color: "#f0f2fc",
        fontFamily: '"Plus Jakarta Sans",sans-serif',
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <StarField />
      <PublicNav alwaysFilled />

      <main style={{ paddingTop: "80px" }}>
        <PricingSection navigate={navigate} />
      </main>
    </div>
  );
}
