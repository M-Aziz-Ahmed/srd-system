export const seedUsers = [
  { email: "vmd@demo.com", password: "password", role: "vmd", name: "VMD Manager" },
  { email: "cad@demo.com", password: "password", role: "cad", name: "CAD Manager" },
  { email: "commercial@demo.com", password: "password", role: "commercial", name: "Commercial Manager" },
  { email: "mmc@demo.com", password: "password", role: "mmc", name: "MMC Manager" },
  { email: "admin@demo.com", password: "password", role: "admin", name: "Admin" }
];

export const getUserByEmail = (email) => {
  return seedUsers.find(u => u.email === email);
};