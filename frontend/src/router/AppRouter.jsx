import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HomePage from '../pages/HomePage';
import RecetaDetailPage from '../pages/RecetaDetailPage';
import NuevaRecetaPage from '../pages/NuevaRecetaPage';
import EditarRecetaPage from '../pages/EditarRecetaPage';
import PerfilPage from '../pages/PerfilPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recetas/:id" element={<RecetaDetailPage />} />
        <Route path="/nueva" element={<NuevaRecetaPage />} />
        <Route path="/editar/:id" element={<EditarRecetaPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
