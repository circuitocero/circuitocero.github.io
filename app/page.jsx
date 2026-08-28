"use client";
import { useState, useEffect } from "react";

export default function CircuitoCeroUnificado() {
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("usuario");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // Repositorio de Archivos
  const [archivoPendiente, setArchivoPendiente] = useState(null);
  const [nombrePersonalizado, setNombrePersonalizado] = useState("");
  const [listaArchivosPublicos, setListaArchivosPublicos] = useState([]);
  const [listaArchivosPendientes, setListaArchivosPendientes] = useState([]);
  const [archivoParaInspeccionar, setArchivoParaInspeccionar] = useState(null);

  // Red Social / Contenido
  const [urlVideoSugerido, setUrlVideoSugerido] = useState("");
  const [textoVideoSugerido, setTextoVideoSugerido] = useState("");
  const [archivoVideoSugerido, setArchivoVideoSugerido] = useState(null);
  
  const [listaVideosPublicos, setListaVideosPublicos] = useState([]);
  const [listaVideosPendientes, setListaVideosPendientes] = useState([]);

  const [pestanaActiva, setPestanaActiva] = useState("videos");

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("cc_sesion_uni");
    if (sesionGuardada) {
      const datos = JSON.parse(sesionGuardada);
      setNombreUsuario(datos.nombre);
      setRolSeleccionado(datos.rol);
      setUsuarioRegistrado(true);
    }

    const archPub = localStorage.getItem("cc_archivos_pub");
    if (archPub) setListaArchivosPublicos(JSON.parse(archPub));

    const archPen = localStorage.getItem("cc_archivos_pen");
    if (archPen) setListaArchivosPendientes(JSON.parse(archPen));

    const vidPub = localStorage.getItem("cc_videos_pub");
    if (vidPub) setListaVideosPublicos(JSON.parse(vidPub));

    const vidPen = localStorage.getItem("cc_videos_pen");
    if (vidPen) setListaVideosPendientes(JSON.parse(vidPen));
  }, []);

  useEffect(() => {
    localStorage.setItem("cc_archivos_pub", JSON.stringify(listaArchivosPublicos));
  }, [listaArchivosPublicos]);

  useEffect(() => {
    localStorage.setItem("cc_archivos_pen", JSON.stringify(listaArchivosPendientes));
  }, [listaArchivosPendientes]);

  useEffect(() => {
    localStorage.setItem("cc_videos_pub", JSON.stringify(listaVideosPublicos));
  }, [listaVideosPublicos]);

  useEffect(() => {
    localStorage.setItem("cc_videos_pen", JSON.stringify(listaVideosPendientes));
  }, [listaVideosPendientes]);

  const manejarRegistro = (e) => {
    e.preventDefault();
    if (!nombreUsuario.trim()) {
      setErrorLogin("Ingresa tu nombre de usuario.");
      return;
    }

    let rolFinal = rolSeleccionado;
    const clave = passwordInput.trim();

    if (rolFinal === "administrador") {
      if (clave !== "circuitocero.mk0103" && clave !== "circuito") {
        setErrorLogin("Contraseña de administrador incorrecta.");
        return;
      }
    } else if (rolFinal === "colaborador") {
      if (clave !== "2704.mk0103" && clave !== "2704") {
        setErrorLogin("Contraseña de colaborador incorrecta.");
        return;
      }
    }

    setErrorLogin("");
    setRolSeleccionado(rolFinal);
    setUsuarioRegistrado(true);
    localStorage.setItem("cc_sesion_uni", JSON.stringify({ nombre: nombreUsuario, rol: rolFinal }));
  };

  const cerrarSesion = () => {
    localStorage.removeItem("cc_sesion_uni");
    setUsuarioRegistrado(false);
    setNombreUsuario("");
    setPasswordInput("");
  };

  const obtenerIdYouTube = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // ---- MANEJADOR ARCHIVOS ----
  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let extension = file.name.split(".").pop().toLowerCase();
    const esImagen = file.type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(extension);

    const lector = new FileReader();
    lector.onload = (evento) => {
      let tipoDetectado = "Documento / Archivo";
      if (["ino", "js", "cpp", "py", "txt", "h", "json", "c"].includes(extension)) tipoDetectado = "Código Fuente";
      else if (esImagen || ["fzz"].includes(extension)) tipoDetectado = "Imagen o Esquema";
      else if (["pdf", "docx", "doc"].includes(extension)) tipoDetectado = "Documento PDF / Texto";

      setArchivoPendiente({
        nombreOriginal: file.name,
        tamaño: (file.size / 1024).toFixed(2) + " KB",
        tipo: tipoDetectado,
        contenido: evento.target.result,
        esImagen: esImagen
      });
      setNombrePersonalizado(file.name);
    };

    if (esImagen || ["pdf", "docx", "doc", "fzz"].includes(extension)) {
      lector.readAsDataURL(file);
    } else {
      lector.readAsText(file);
    }
  };

  const enviarSugerenciaArchivo = () => {
    if (!archivoPendiente) return;
    const nuevoItem = {
      ...archivoPendiente,
      id: Date.now(),
      nombre: nombrePersonalizado.trim() || archivoPendiente.nombreOriginal,
      autor: nombreUsuario,
      rolAutor: rolSeleccionado,
      fecha: new Date().toLocaleString("es-MX")
    };

    if (rolSeleccionado === "administrador") {
      setListaArchivosPublicos([nuevoItem, ...listaArchivosPublicos]);
      alert("¡Archivo publicado directamente en el repositorio!");
    } else {
      setListaArchivosPendientes([nuevoItem, ...listaArchivosPendientes]);
      alert("¡Sugerencia de archivo enviada al Administrador para su revisión!");
    }

    setArchivoPendiente(null);
    setNombrePersonalizado("");
  };

  // ---- MANEJADOR VIDEOS / CONTENIDO ----
  const manejarCargaVideoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lector = new FileReader();
    lector.onload = (ev) => {
      setArchivoVideoSugerido(ev.target.result);
    };
    lector.readAsDataURL(file);
  };

  const enviarSugerenciaVideo = (e) => {
    e.preventDefault();
    if (!urlVideoSugerido.trim() && !archivoVideoSugerido && !textoVideoSugerido.trim()) {
      alert("Debes agregar al menos texto, una URL de YouTube o un archivo de video.");
      return;
    }

    const nuevoVideoSugerido = {
      id: Date.now(),
      texto: textoVideoSugerido.trim() || "Publicación de la comunidad",
      urlYouTube: urlVideoSugerido.trim(),
      archivoVideo: archivoVideoSugerido,
      autor: nombreUsuario,
      rolAutor: rolSeleccionado,
      fecha: new Date().toLocaleString("es-MX")
    };

    if (rolSeleccionado === "administrador") {
      setListaVideosPublicos([nuevoVideoSugerido, ...listaVideosPublicos]);
      alert("¡Contenido / Video publicado directamente!");
    } else {
      setListaVideosPendientes([nuevoVideoSugerido, ...listaVideosPendientes]);
      alert("¡Sugerencia de contenido enviada al Administrador para su revisión!");
    }

    setUrlVideoSugerido("");
    setTextoVideoSugerido("");
    setArchivoVideoSugerido(null);
  };

  if (!usuarioRegistrado) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 25px rgba(0,0,0,0.3)", borderTop: "6px solid #dc2626" }}>
          <h1 style={{ color: "#dc2626", fontSize: "2rem", marginBottom: "8px", fontWeight: "900", textAlign: "center" }}>Circuito Cero</h1>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "25px", fontSize: "0.9rem" }}>Acceso General</p>

          <form onSubmit={manejarRegistro} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#0f172a", marginBottom: "6px", fontWeight: "700" }}>Nombre:</label>
              <input type="text" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} placeholder="Ej. Erica Montiel" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", outline: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#0f172a", marginBottom: "6px", fontWeight: "700" }}>Rol:</label>
              <select value={rolSeleccionado} onChange={(e) => { setRolSeleccionado(e.target.value); setPasswordInput(""); setErrorLogin(""); }} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", outline: "none", fontWeight: "600" }}>
                <option value="usuario">Usuario / Explorador</option>
                <option value="colaborador">Colaborador / Creador</option>
                <option value="administrador">Administrador del Sistema</option>
              </select>
            </div>

            {rolSeleccionado !== "usuario" && (
              <div style={{ background: "#fef2f2", padding: "14px", borderRadius: "8px", border: "1px solid #fca5a5" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#dc2626", marginBottom: "6px", fontWeight: "700" }}>Contraseña:</label>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #f87171", background: "#ffffff", outline: "none" }} />
              </div>
            )}

            {errorLogin && <p style={{ color: "#dc2626", fontSize: "0.85rem", margin: 0, fontWeight: "700", textAlign: "center" }}>{errorLogin}</p>}

            <button type="submit" style={{ padding: "14px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "1rem", cursor: "pointer" }}>Entrar</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <header style={{ background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)", color: "#ffffff", padding: "20px 40px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", margin: "0 0 2px 0", fontWeight: "900" }}>Circuito Cero</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: "0.9" }}>Sesión: <strong>{nombreUsuario}</strong> • <span style={{ background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "4px" }}>{rolSeleccionado.toUpperCase()}</span></p>
          </div>
          
          <nav style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setPestanaActiva("videos")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: pestanaActiva === "videos" ? "2px solid #eab308" : "1px solid rgba(255,255,255,0.3)",
                background: pestanaActiva === "videos" ? "#ffffff" : "rgba(0,0,0,0.2)",
                color: pestanaActiva === "videos" ? "#dc2626" : "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              📺 Red Social / Contenido
            </button>

            <button
              onClick={() => setPestanaActiva("requisitos")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: pestanaActiva === "requisitos" ? "2px solid #eab308" : "1px solid rgba(255,255,255,0.3)",
                background: pestanaActiva === "requisitos" ? "#ffffff" : "rgba(0,0,0,0.2)",
                color: pestanaActiva === "requisitos" ? "#dc2626" : "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              📁 Repositorio de Archivos
            </button>

            <button onClick={cerrarSesion} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ffffff", background: "#0f172a", color: "#ffffff", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Salir</button>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
        
        {/* ================= VISTA 1: RED SOCIAL / CONTENIDO ================= */}
        {pestanaActiva === "videos" && (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "6px" }}>Red Social y Contenido Técnico</h2>
            
            {rolSeleccionado === "usuario" ? (
              <p style={{ color: "#64748b", marginBottom: "25px", fontSize: "0.95rem" }}>Explora las publicaciones compartidas por la comunidad.</p>
            ) : (
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", fontWeight: "700" }}>{rolSeleccionado === "administrador" ? "Publicar Contenido Directo" : "Sugerir Contenido / Video"}</h3>
                <form onSubmit={enviarSugerenciaVideo} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Texto o Mensaje:</label>
                    <textarea value={textoVideoSugerido} onChange={(e) => setTextoVideoSugerido(e.target.value)} placeholder="¿Qué quieres compartir?" rows="2" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>URL de YouTube (Opcional):</label>
                    <input type="text" value={urlVideoSugerido} onChange={(e) => setUrlVideoSugerido(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>O Subir Archivo de Video:</label>
                    <input type="file" accept="video/*" onChange={manejarCargaVideoFile} style={{ width: "100%", padding: "8px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                    {archivoVideoSugerido && (
                      <div style={{ marginTop: "10px", padding: "8px", background: "#f1f5f9", borderRadius: "6px" }}>
                        <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", fontWeight: "bold", color: "#16a34a" }}>✓ Video listo para enviar (Vista previa):</p>
                        <video controls style={{ width: "100%", maxHeight: "140px", borderRadius: "6px", background: "#000" }}>
                          <source src={archivoVideoSugerido} />
                        </video>
                      </div>
                    )}
                  </div>
                  <button type="submit" style={{ padding: "12px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    {rolSeleccionado === "administrador" ? "Publicar Directamente" : "Enviar Sugerencia al Administrador"}
                  </button>
                </form>
              </div>
            )}

            {/* BANDEJA ADMIN VIDEOS */}
            {rolSeleccionado === "administrador" && listaVideosPendientes.length > 0 && (
              <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", padding: "20px", borderRadius: "14px", marginBottom: "25px" }}>
                <h3 style={{ color: "#b45309", fontWeight: "800", marginBottom: "10px", fontSize: "1.1rem" }}>⚠️ Sugerencias de Contenido Pendientes (Revisión de Administrador)</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
                  {listaVideosPendientes.map((vid) => {
                    const ytId = obtenerIdYouTube(vid.urlYouTube);
                    return (
                      <li key={vid.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #fcd34d", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <strong>{vid.texto}</strong><br />
                          <small style={{ color: "#64748b" }}>Sugerido por: <strong>{vid.autor}</strong> ({vid.rolAutor}) - {vid.fecha}</small>
                        </div>

                        {vid.archivoVideo && (
                          <video controls style={{ width: "100%", maxHeight: "150px", borderRadius: "6px", background: "#000" }}>
                            <source src={vid.archivoVideo} />
                          </video>
                        )}

                        {ytId && (
                          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "6px", background: "#000" }}>
                            <iframe src={`https://www.youtube.com/embed/${ytId}`} title="YouTube preview" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen />
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          <button onClick={() => { setListaVideosPublicos([vid, ...listaVideosPublicos]); setListaVideosPendientes(listaVideosPendientes.filter(v => v.id !== vid.id)); }} style={{ padding: "6px 14px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Aprobar y Publicar</button>
                          <button onClick={() => setListaVideosPendientes(listaVideosPendientes.filter(v => v.id !== vid.id))} style={{ padding: "6px 14px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Rechazar</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* MURO DE PUBLICACIONES PÚBLICAS */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ marginBottom: "20px", fontWeight: "700", fontSize: "1.2rem" }}>Muro de la Comunidad</h3>
              {listaVideosPublicos.length === 0 ? (
                <p style={{ color: "#64748b" }}>No hay publicaciones todavía.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                  {listaVideosPublicos.map((v) => {
                    const ytId = obtenerIdYouTube(v.urlYouTube);
                    return (
                      <div key={v.id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
                        <p style={{ margin: 0, fontWeight: "700", fontSize: "0.95rem" }}>{v.texto}</p>
                        <small style={{ color: "#64748b" }}>Publicado por: <strong>{v.autor}</strong> ({v.fecha})</small>

                        {v.archivoVideo && (
                          <video controls style={{ width: "100%", maxHeight: "180px", borderRadius: "6px", background: "#000" }}>
                            <source src={v.archivoVideo} />
                          </video>
                        )}

                        {ytId && (
                          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "6px", background: "#000" }}>
                            <iframe src={`https://www.youtube.com/embed/${ytId}`} title="YouTube video player" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen />
                          </div>
                        )}

                        {rolSeleccionado === "administrador" && (
                          <button onClick={() => setListaVideosPublicos(listaVideosPublicos.filter(item => item.id !== v.id))} style={{ position: "absolute", top: "10px", right: "10px", background: "#fee2e2", color: "#dc2626", border: "1px solid #f87171", borderRadius: "6px", padding: "4px 8px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}>Eliminar</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VISTA 2: REPOSITORIO DE ARCHIVOS ================= */}
        {pestanaActiva === "requisitos" && (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "6px" }}>Repositorio de Archivos y Códigos</h2>
            <p style={{ color: "#64748b", marginBottom: "25px", fontSize: "0.95rem" }}>
              {rolSeleccionado === "administrador" ? "Sube y publica archivos directamente o revisa sugerencias." : "Sube cualquier archivo para sugerirlo. Podrás ver su vista previa antes de enviarlo."}
            </p>

            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: "700" }}>{rolSeleccionado === "administrador" ? "Publicar Archivo Directo" : "Sugerir Archivo al Repositorio"}</h3>
              <input type="file" onChange={manejarSeleccionArchivo} style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", width: "100%", border: "1px solid #cbd5e1" }} />
            </div>

            {/* SECCIÓN DE VISTA PREVIA (Sin barras laterales negras) */}
            {archivoPendiente && (
              <div style={{ background: "#ffffff", border: "2px solid #eab308", padding: "25px", borderRadius: "14px", marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#b45309", marginBottom: "12px", fontWeight: "800" }}>👁️ Vista Previa: Verifica tu archivo antes de enviar</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "10px" }}>Tipo detectado: <strong>{archivoPendiente.tipo}</strong> ({archivoPendiente.tamaño})</p>
                
                {archivoPendiente.esImagen ? (
                  <div style={{ width: "100%", background: "#f8fafc", borderRadius: "6px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px", padding: "10px", border: "1px solid #cbd5e1" }}>
                    <img src={archivoPendiente.contenido} alt="Vista previa" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }} />
                  </div>
                ) : (
                  <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "12px", borderRadius: "6px", maxHeight: "120px", overflow: "auto", fontSize: "0.75rem", marginBottom: "15px" }}>{archivoPendiente.contenido}</pre>
                )}

                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Nombre personalizado:</label>
                <input type="text" value={nombrePersonalizado} onChange={(e) => setNombrePersonalizado(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "15px" }} />
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={enviarSugerenciaArchivo} style={{ padding: "10px 20px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    {rolSeleccionado === "administrador" ? "Publicar Directamente" : "Confirmar y Enviar Sugerencia"}
                  </button>
                  <button onClick={() => setArchivoPendiente(null)} style={{ padding: "10px 20px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Cancelar / Cambiar archivo</button>
                </div>
              </div>
            )}

            {/* BANDEJA DE MODERACIÓN DE ARCHIVOS EXCLUSIVA PARA EL ADMIN */}
            {rolSeleccionado === "administrador" && listaArchivosPendientes.length > 0 && (
              <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", padding: "22px", borderRadius: "14px", marginBottom: "25px" }}>
                <h3 style={{ color: "#b45309", fontWeight: "800", marginBottom: "12px", fontSize: "1.1rem" }}>⚠️ Sugerencias de Archivos Pendientes (Revisión de Administrador)</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
                  {listaArchivosPendientes.map((item) => (
                    <li key={item.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #fcd34d", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <strong>{item.nombre}</strong><br />
                        <small style={{ color: "#dc2626", fontWeight: "bold" }}>{item.tipo}</small> — Sugerido por: <strong>{item.autor}</strong> ({item.rolAutor})
                      </div>

                      {item.esImagen ? (
                        <div style={{ width: "100%", background: "#f8fafc", borderRadius: "6px", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px", border: "1px solid #cbd5e1" }}>
                          <img src={item.contenido} alt="Inspección admin" style={{ maxWidth: "100%", maxHeight: "160px", objectFit: "contain", borderRadius: "4px" }} />
                        </div>
                      ) : (
                        <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "8px", borderRadius: "6px", maxHeight: "80px", overflow: "auto", fontSize: "0.7rem" }}>{item.contenido}</pre>
                      )}

                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => { setListaArchivosPublicos([item, ...listaArchivosPublicos]); setListaArchivosPendientes(listaArchivosPendientes.filter(i => i.id !== item.id)); }} style={{ padding: "6px 12px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Aprobar</button>
                        <button onClick={() => setListaArchivosPendientes(listaArchivosPendientes.filter(i => i.id !== item.id))} style={{ padding: "6px 12px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Rechazar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* REPOSITORIO PÚBLICO (Con Botón de Borrar exclusivo para el Administrador) */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ marginBottom: "15px", fontWeight: "700", fontSize: "1.2rem" }}>📁 Archivos Aprobados en el Repositorio</h3>
              {listaArchivosPublicos.length === 0 ? <p style={{ color: "#64748b" }}>No hay archivos aprobados todavía.</p> : (
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {listaArchivosPublicos.map((item) => (
                    <li key={item.id} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", gap: "10px" }}>
                      <div>
                        <strong>{item.nombre}</strong><br />
                        <small style={{ color: "#64748b" }}>Aporte de {item.autor}</small>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setArchivoParaInspeccionar(item)} style={{ padding: "6px 14px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Ver / Descargar</button>
                        
                        {/* Botón de borrar visible solo para el administrador */}
                        {rolSeleccionado === "administrador" && (
                          <button onClick={() => setListaArchivosPublicos(listaArchivosPublicos.filter(i => i.id !== item.id))} style={{ padding: "6px 10px", background: "#fee2e2", color: "#dc2626", border: "1px solid #f87171", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>Borrar</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* VISUALIZADOR DE ARCHIVO (Limpio, sin fondos negros a los lados) */}
            {archivoParaInspeccionar && (
              <div style={{ background: "#ffffff", border: "2px solid #2563eb", padding: "24px", borderRadius: "14px", marginTop: "25px" }}>
                <h3 style={{ color: "#2563eb", fontWeight: "800", marginBottom: "10px" }}>Inspeccionando: {archivoParaInspeccionar.nombre}</h3>
                {archivoParaInspeccionar.esImagen ? (
                  <div style={{ width: "100%", background: "#f8fafc", borderRadius: "6px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px", padding: "15px", border: "1px solid #cbd5e1" }}>
                    <img src={archivoParaInspeccionar.contenido} alt="Visor" style={{ maxWidth: "100%", maxHeight: "350px", objectFit: "contain", borderRadius: "4px" }} />
                  </div>
                ) : (
                  <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "12px", borderRadius: "6px", maxHeight: "150px", overflow: "auto", fontSize: "0.8rem", marginBottom: "15px" }}>{archivoParaInspeccionar.contenido}</pre>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <a href={archivoParaInspeccionar.esImagen || archivoParaInspeccionar.contenido?.startsWith("data:") ? archivoParaInspeccionar.contenido : `data:text/plain;charset=utf-8,${encodeURIComponent(archivoParaInspeccionar.contenido || "")}`} download={archivoParaInspeccionar.nombre} style={{ padding: "10px 20px", background: "#16a34a", color: "#ffffff", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>Descargar Archivo</a>
                  <button onClick={() => setArchivoParaInspeccionar(null)} style={{ padding: "10px 20px", background: "#64748b", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Cerrar</button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}