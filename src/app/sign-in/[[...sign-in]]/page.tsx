import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e1e1e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 6px 16px rgba(29, 78, 216, 0.25)"
            }}
          >
            C
          </div>
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "24px",
              letterSpacing: "-0.03em",
              color: "#1e1e1e"
            }}
          >
            CrossTech<span style={{ color: "#1d4ed8" }}>OS</span>
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0, fontWeight: 500 }}>
          Enterprise Multi-Tenant Collaboration & Department Workspace
        </p>
      </div>

      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" />
    </div>
  );
}
