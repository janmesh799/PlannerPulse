"use client";
import SignUpForm from "@/components/SignUp/SignUpForm";
import SignUpImage from "@/components/SignUp/SignUpImage";
import withoutAuth from "@/hoc/withoutAuth";
import { useAppSelector } from "@/hooks/redux";
import { RootState } from "@/store";
import "./SignUp.css"; // Import the CSS file
import getColorWithOpacity from "@/utils/getColorWithOpacity";

function SignUp() {
  const colors = useAppSelector((state: RootState) => state.theme.colors);

  return (
    <div className="signup-container">
      <div
        className="signup-box"
        style={{ backgroundColor: getColorWithOpacity(colors.background,0.5) }}
      >
        <SignUpImage />
        <SignUpForm />
      </div>
    </div>
  );
}

export default withoutAuth(SignUp);
