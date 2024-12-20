import { notification } from "antd";
import { UserContext } from "contexts/UserContext";
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useContext,
  useState,
} from "react";
import { FiCheckCircle } from "react-icons/fi";
import { LoginDtoType, RegisterDtoType, User } from "types/user";
import { AuthType, SignUpType } from "../types";

export const useFormControls = () => {
  const { login, register, handleWebAuthRegister } = useContext(UserContext);
  const [authType, setAuthType] = useState<AuthType>(AuthType.biometry);
  const [formState, setFormState] = useState<SignUpType>(SignUpType.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    remember: false,
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBiometricAuth = useCallback(async () => {
    const response = await handleWebAuthRegister();

    notification.success({
      description: "Success",
      message:
        !response?.firstName && !response?.lastName
          ? "Welcome!"
          : `Welcome ${response?.firstName ?? ""} ${response?.lastName ?? ""}`,
      icon: <FiCheckCircle />,
      type: "success",
    });
  }, [handleWebAuthRegister]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e!.preventDefault(); // Prevent page refresh
    console.log(e);
    let response: User | null = null;
    let authDto;

    switch (formState) {
      case "login":
        authDto = {
          email: formData.email,
          password: formData.password,
        };

        response = await login(authDto as LoginDtoType);
        break;
      case "register":
        authDto = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName ?? "",
          lastName: formData.lastName ?? "",
        };
        response = await register(authDto as RegisterDtoType);

        break;
      default:
        break;
    }

    notification.success({
      description: "Success",
      message: `Welcome ${response?.firstName} ${response?.lastName}`,
      icon: <FiCheckCircle />,
      type: "success",
    });
  };

  return {
    handleInputChange,
    handleBiometricAuth,
    handleSubmit,
    setFormState,
    authType,
    setAuthType,
    formState,
    formData,
  };
};
