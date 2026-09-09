// import { useState } from "react";
// import { AuthContext } from "./AuthContext";
// import { storage } from "../utils/storage";

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   const login = (userData) => setUser(userData);

//   const logout = () => {
//     storage.clearTokens();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         setUser,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }