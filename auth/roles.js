import auth from "./Middleware.js";

export const isAdmin = () => auth("admin");
export const isDoctor = () => auth("doctor");
export const isUser = () => auth("user");

// Usage example in routes:
// router.get("/secure", isAdmin(), (req, res) => { ... });
