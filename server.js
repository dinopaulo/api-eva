const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT || 8081



const app = express();
app.use(cors);
app.use(bodyParser.json()); // Middleware para parsear JSON

const db = mysql.createConnection({
  host: "vmi1917642.contaboserver.net",
  user: "pruebaitrededu_sig_user",
  password: "Ch1no_2024*",
  database: "pruebaitrededu_sig",
  
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
});
// Nueva ruta para eliminar un cuestionario
app.delete("/api/cuestionario/:id", (req, res) => {
  const idInstrumento = req.params.id;
  const sql = "DELETE FROM instrumentos WHERE idInstrumento = ?";

  db.query(sql, [idInstrumento], (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).send("Error deleting data");
    }
    res.status(200).send("Data deleted successfully");
  });
});

app.get("/api/periodos", (req, res) => {
  const sql = "SELECT IdPeriodoLectivo, DescripPeriodoLect FROM periodolectivo";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

app.put("/api/cuestionario/:id", (req, res) => {
  const idInstrumento = req.params.id;
  const {
    idPeriodoLectivo,
    nombreInstrumento,
    ponderacionInstrumento,
    fechaInicio,
    fechaFin,
    estadoInstrumento,
    usuarioModifica,
  } = req.body;

  const sql = `
    UPDATE instrumentos SET 
        idPeriodoLectivo = ?, 
        nombreInstrumento = ?, 
        ponderacionInstrumento = ?, 
        fechaInicio = ?, 
        fechaFin = ?, 
        estadoInstrumento = ?, 
        usuarioModifica = ?
      WHERE idInstrumento = ?
    `;

  db.query(
    sql,
    [
      idPeriodoLectivo,
      nombreInstrumento,
      ponderacionInstrumento,
      fechaInicio,
      fechaFin,
      estadoInstrumento,
      usuarioModifica,
      idInstrumento,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).send("Error updating data");
      }
      res.status(200).send("Data updated successfully");
    }
  );
});

app.get("/api/instrumentos", (req, res) => {
  const sql = `
    SELECT 
            i.idInstrumento,
            i.nombreInstrumento,
            i.ponderacionInstrumento,
            i.estadoInstrumento,
            i.fechaInicio,
            i.fechaFin,
            p.DescripPeriodoLect AS periodoLectivo
        FROM 
            instrumentos i
        JOIN 
            periodolectivo p ON i.idPeriodoLectivo = p.IdPeriodoLectivo
    
    `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

app.get("/api/periodos", (req, res) => {
  const sql =
    "SELECT IdPeriodoLectivo, DescripPeriodoLect FROM periodolectivo ";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// Nueva ruta para insertar cuestionarios
app.post("/api/cuestionario", (req, res) => {
  const {
    idPeriodoLectivo,
    nombreInstrumento,
    ponderacionInstrumento,
    fechaInicio,
    fechaFin,
    estadoInstrumento,
    usuarioGraba,
    usuarioModifica,
  } = req.body;

  const sql = `
    INSERT INTO instrumentos (
            idPeriodoLectivo, nombreInstrumento, ponderacionInstrumento, fechaInicio, fechaFin, estadoInstrumento, usuarioGraba, usuarioModifica
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [
      idPeriodoLectivo,
      nombreInstrumento,
      ponderacionInstrumento,
      fechaInicio,
      fechaFin,
      estadoInstrumento,
      usuarioGraba,
      usuarioModifica,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      res.status(200).send("Data inserted successfully");
    }
  );
});

//RUTA PARA TRAER LOS CUESTIONARIOS CON SU PERIODOLECTIVO SELECCIONADO
app.get("/api/cuestionario-periodolect", (req, res) => {
  const sql = `
    SELECT 
        i.idInstrumento,
        CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta

    FROM
        instrumentos i
    JOIN 
        periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

//RUTA PARA TARER LAS PREGUNTAS (PREGUNTA-INSTRUMENTO-PERIODO)
app.get("/api/pregunta-instrumento-periodo", (req, res) => {
  const sql = `
  SELECT 
      p.idPregunta,
      i.idInstrumento,
      CONCAT(p.pregunta, ' - ' , i.nombreInstrumento, ' - ', pl.DescripPeriodoLect) AS completaPregunta
    FROM 
      pregunta p
    JOIN 
      instrumentos i ON p.idInstrumento = i.idInstrumento
    JOIN 
      periodolectivo pl ON i.idPeriodoLectivo = pl.IdPeriodoLectivo
  
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

// RUTA PARA CREAR LAS PREGUNTAS (ENUNCIADO, ESTADO)
app.post("/api/preguntas", (req, res) => {
  const { idInstrumento, preguntas } = req.body;
  console.log("Received Data:", req.body); // Debugging line
  const values = preguntas.map((p) => [
    idInstrumento,
    p.enunciado,
    p.estado,
    "usuarioGraba",
    "usuarioModifica",
  ]);
  const query = `INSERT INTO pregunta (idInstrumento, pregunta, estadoPregunta, usuarioGraba, usuarioModifica) VALUES ?`;

  db.query(query, [values], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send("Preguntas insertadas correctamente");
  });
});

//RUTA PARA TRAER LOS DATOS DE LAS PREGUNTAS
app.get("/api/preguntas", (req, res) => {
  const sql = `
    SELECT 
      p.idPregunta,
      p.pregunta,
      p.estadoPregunta,
      i.idInstrumento,
      CONCAT(i.nombreInstrumento, ' - ', pl.DescripPeriodoLect) AS descripInstrumento
    FROM 
      pregunta p
    JOIN 
      instrumentos i ON p.idInstrumento = i.idInstrumento
    JOIN 
      periodolectivo pl ON i.idPeriodoLectivo = pl.IdPeriodoLectivo
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

// RUTA PARA TRAER LOS DATOS DE LAS OPCIONES
app.get("/api/opciones", (req, res) => {
  const sql = `
    SELECT 
      o.idOpcion,
      o.nombreOpcion,
      o.valorOpcion,
      o.estadoOpcion,
      p.idPregunta,
      i.idInstrumento,
      CONCAT(p.pregunta, ' - ' , i.nombreInstrumento, ' - ', pl.DescripPeriodoLect) AS completaPregunta
    FROM 
      opcion_preguntas o
    JOIN
      pregunta p ON o.idPregunta = p.idPregunta
    JOIN 
      instrumentos i ON p.idInstrumento = i.idInstrumento
    JOIN 
      periodolectivo pl ON i.idPeriodoLectivo = pl.IdPeriodoLectivo
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

// Ruta de actualización para actualizar preguntas existentes
app.put("/api/preguntas/:id", (req, res) => {
  const idPregunta = req.params.id;
  const { idInstrumento, preguntas } = req.body;

  console.log("Received PUT request for ID:", idPregunta);
  console.log("Request body:", req.body);

  const query = `
    UPDATE pregunta 
    SET 
      idInstrumento = ?, 
      pregunta = ?, 
      estadoPregunta = ?,
      usuarioModifica = ?
    WHERE idPregunta = ?
  `;

  const values = [
    idInstrumento,
    preguntas[0].enunciado,
    preguntas[0].estado,
    "usuarioModifica",
    idPregunta,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).send("Error updating data");
    }
    res.status(200).send("Data updated successfully");
  });
});

//Ruta para eliminar una pregunta
app.delete("/api/preguntas/:id", (req, res) => {
  const idPregunta = req.params.id;
  const sql = "DELETE FROM pregunta WHERE idPregunta = ?";

  db.query(sql, [idPregunta], (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).send("Error deleting data");
    }
    res.status(200).send("Data deleted successfully");
  });
});

// Ruta para actualizar opciones para las preguntas
app.put("/api/opciones/:id", (req, res) => {
  const idOpcion = req.params.id;
  const { nombreOpcion, valorOpcion, estadoOpcion } = req.body;
  const query = `
    UPDATE opcion_preguntas 
    SET nombreOpcion = ?, valorOpcion = ?, estadoOpcion = ?, usuarioModifica = 'usuarioModifica'
    WHERE idOpcion = ?
  `;

  db.query(
    query,
    [nombreOpcion, valorOpcion, estadoOpcion, idOpcion],
    (err, result) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).send("Error updating data");
      }
      res.status(200).send("Opcion actualizada correctamente");
    }
  );
});

// Ruta para eliminar una opción
app.delete("/api/opciones/:id", (req, res) => {
  const idOpcion = req.params.id;
  const query = "DELETE FROM opcion_preguntas WHERE idOpcion = ?";

  db.query(query, [idOpcion], (err, result) => {
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).send("Error deleting data");
    }
    res.status(200).send("Opción eliminada correctamente");
  });
});

// Ruta para insertar opciones para las preguntas
app.post("/api/opciones", (req, res) => {
  const { idPregunta, opciones } = req.body;
  console.log("Received Data:", req.body); // Debugging line
  const values = opciones.map((opcion) => [
    idPregunta,
    opcion.nombreOpcion,
    opcion.valorOpcion,
    opcion.estadoOpcion,
    "usuarioGraba",
    "usuarioModifica",
  ]);
  const query = `INSERT INTO opcion_preguntas (idPregunta, nombreOpcion, valorOpcion, estadoOpcion, usuarioGraba, usuarioModifica) VALUES ?`;

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).send("Opciones insertadas correctamente");
  });
});

//RUTA PARA TRAER LOS CUESTIONARIOS DE SOLAMENTE AUTOEVALUACION CON SU PERIODOLECTIVO SELECCIONADO
app.get("/api/cuestionario-autoeval", (req, res) => {
  const sql = `
    SELECT 
      i.idInstrumento,
      i.idPeriodoLectivo,
      CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta
    FROM
      instrumentos i
    JOIN 
      periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    WHERE nombreInstrumento = "AUTOEVALUACION - DOCENTE"
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});
//RUTA PARA TRAER LOS DOCENTES DEL INSTITUTO
app.get("/api/docentes", (req, res) => {
  const sql = `
     SELECT DISTINCT
        p.CedulaPersonal, 
        p.NombresPersonal, 
        p.ApellidosPersonal,
        p.ApellidosPersonal2, 
        p.IdPersonal,
        CONCAT(p.ApellidosPersonal,' ', p.ApellidosPersonal2, ' ', p.NombresPersonal) AS nombreCompleto

     FROM distributivo d 
     INNER JOIN personal p ON d.IdDocente = p.IdPersonal 
     INNER JOIN usuario u ON p.IdPersonal = u.IdPersonal 
     INNER JOIN rolusuario r ON u.IdRolUsuario = r.IdRolUsuario 
     WHERE u.IdRolUsuario = 7 OR u.IdRolUsuario = 6 ;
    `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

//RUTA PARA TRAER LAS CARRERAS DEL DOCENTE
app.get("/api/carreras-docente/:id", (req, res) => {
  const idDocente = req.params.id;
  const sql = `
    SELECT DISTINCT
      c.IdCarrera,
      c.NombreCarrera
    FROM 
      distributivo d
    JOIN 
      carrera c ON d.IdCarrera = c.IdCarrera
    WHERE 
      d.IdDocente = ? AND d.EstadoDistributivo = 'A';
  `;

  db.query(sql, [idDocente], (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

//RUTA PARA TRAER LA ASIGNATURA
app.get(
  "/api/asignaturas-docente/:idDocente/:idCarrera/:idPeriodoAcademico",
  (req, res) => {
    const { idDocente, idCarrera, idPeriodoAcademico } = req.params;
    const sql = `
    SELECT 
      DISTINCT a.IdAsignatura,
      a.NombreAsignatura
    FROM 
      asignatura a
    JOIN 
      distributivo d ON a.IdAsignatura = d.IdAsignatura
    WHERE 
      d.IdDocente = ?
      AND a.IdCarrera = ?
      AND d.IdPeriodoAcademico = ?
      AND d.EstadoDistributivo = 'A'
  `;

    db.query(sql, [idDocente, idCarrera, idPeriodoAcademico], (err, data) => {
      if (err) {
        console.error("Error fetching asignaturas:", err);
        return res.status(500).send("Error fetching asignaturas");
      }

      res.json(data);
    });
  }
);

app.get(
  "/api/paralelos-docente/:idDocente/:idCarrera/:idInstrumento/:idPeriodoAcademico",
  (req, res) => {
    const { idDocente, idCarrera, idInstrumento, idPeriodoAcademico } =
      req.params;
    const sql = `
    SELECT 
      DISTINCT p.idParalelo,
      p.DescripParalelo
    FROM 
      distributivo d
    JOIN 
      paralelo p ON d.Paralelo = p.idParalelo
    JOIN 
      instrumentos i ON d.idPeriodoLectivo = i.idPeriodoLectivo
    WHERE 
      d.IdDocente = ?
      AND d.IdCarrera = ?
      AND i.idInstrumento = ?
      AND d.IdPeriodoAcademico = ?
      AND d.EstadoDistributivo = 'A'
  `;

    db.query(
      sql,
      [idDocente, idCarrera, idInstrumento, idPeriodoAcademico],
      (err, data) => {
        if (err) {
          console.error("Error fetching paralelos:", err);
          return res.status(500).send("Error fetching paralelos");
        }

        res.json(data);
      }
    );
  }
);

app.get("/api/cuestionario/:idInstrumento", (req, res) => {
  const idInstrumento = req.params.idInstrumento;
  const sqlPreguntas = `
    SELECT 
      p.idPregunta,
      p.pregunta,
      o.idOpcion,
      o.nombreOpcion,
      o.valorOpcion
    FROM 
      pregunta p
    JOIN 
      opcion_preguntas o ON p.idPregunta = o.idPregunta
    WHERE
      p.idInstrumento = ?
  `;

  db.query(sqlPreguntas, [idInstrumento], (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }

    const cuestionario = data.reduce((acc, row) => {
      const { idPregunta, pregunta, idOpcion, nombreOpcion, valorOpcion } = row;
      if (!acc[idPregunta]) {
        acc[idPregunta] = {
          id: idPregunta,
          questionText: pregunta,
          options: [],
        };
      }
      acc[idPregunta].options.push({
        id: idOpcion,
        text: nombreOpcion,
        value: valorOpcion,
      });
      return acc;
    }, {});

    res.json(Object.values(cuestionario));
  });
});

// Route to validate auto-evaluation status
app.get(
  "/api/validate-autoeval/:idInstrumento/:idEvaluador/:idCarrera/:idAsignatura/:idParalelo",
  (req, res) => {
    const { idInstrumento, idEvaluador, idCarrera, idAsignatura, idParalelo } =
      req.params;
    const sql = `
    SELECT ejecucionStatus
    FROM auto_eval
    WHERE idInstrumento = ? AND idEvaluador = ? AND idCarrera = ? AND idAsignatura = ? AND idParalelo = ?
  `;

    db.query(
      sql,
      [idInstrumento, idEvaluador, idCarrera, idAsignatura, idParalelo],
      (err, data) => {
        if (err) {
          console.error("Error fetching validation data:", err);
          return res.status(500).send("Error fetching validation data");
        }
        res.json(data[0] || { ejecucionStatus: 0 }); // Return 0 if no record found
      }
    );
  }
);

//ENVIAR DATOS CABECERA AUTO EVAL
// Ruta para insertar los datos del formulario en auto_eval y devolver el idEvaluacion
//ENVIAR DATOS CABECERA AUTO EVAL
app.post("/api/auto_eval", (req, res) => {
  const {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    idPeriodoLectivo,
    idPeriodoAcademico,
    idAsignatura,
    idParalelo,
    estadoEvaluacion,
  } = req.body;

  const sql = `
    INSERT INTO auto_eval (
      idInstrumento, idEvaluador, idEvaluado, idCarrera, idPeriodoLectivo, 
      idPeriodoAcademico, idAsignatura, idParalelo, estadoEvaluacion, ejecucionStatus, 
      usuarioGraba, usuarioModifica
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'usuarioGraba', 'usuarioModifica');
  `;

  db.query(
    sql,
    [
      idInstrumento,
      idEvaluador,
      idEvaluado,
      idCarrera,
      idPeriodoLectivo,
      idPeriodoAcademico,
      idAsignatura,
      idParalelo,
      estadoEvaluacion,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      const idEvaluacion = result.insertId;
      res.status(200).json({ idEvaluacion });
    }
  );
});

// Ruta para insertar los detalles de la evaluación
// Ruta para insertar los datos del formulario en auto_eval y devolver el idEvaluacion
app.post("/api/det_auto_eval", (req, res) => {
  const { idEvaluacion, respuestas } = req.body;

  const values = respuestas.map((respuesta) => [
    idEvaluacion,
    respuesta.idPregunta,
    respuesta.idOpcion,
    respuesta.valorOpcion,
    "usuarioGraba",
    "usuarioModifica",
  ]);

  const sql = `
    INSERT INTO det_auto_eval (
      idEvaluacion, idPregunta, idOpcion, valorOpcion, usuarioGraba, usuarioModifica
    ) VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).send("Data inserted successfully");
  });
});

///RUTA PARA EL LOGIN
// Endpoint de login
app.post("/login", (req, res) => {
  const { user, password } = req.body;

  const queryDocente = "SELECT * FROM usuario WHERE AbreviaturaUsuario = ?";
  const queryEstudiante =
    "SELECT * FROM usuario_estudiante WHERE AbreviaturaUsuarioEstudiante = ?";

  db.query(queryDocente, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      const usuario = results[0];
      const hashedPassword = usuario.ClaveUsuario;

      if (password === hashedPassword) {
        const personalQuery =
          "SELECT NombresPersonal, ApellidosPersonal FROM personal WHERE IdPersonal = ?";
        db.query(
          personalQuery,
          [usuario.IdPersonal],
          (err, personalResults) => {
            if (err) return res.status(500).json({ error: "Database error" });

            const personal = personalResults[0];
            const initials = `${personal.NombresPersonal.charAt(
              0
            )}${personal.ApellidosPersonal.charAt(0)}`.toUpperCase();

            console.log("Login response for administrative user:", {
              initials,
            });

            return res.json({
              message: "Login exitoso",
              idPersonal: usuario.IdPersonal,
              user: usuario.AbreviaturaUsuario,
              initials,
              IdRolUsuario: usuario.IdRolUsuario, // Asegúrate de incluir el rol del usuario
            });
          }
        );
      } else {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
    } else {
      db.query(queryEstudiante, [user], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0)
          return res.status(401).json({ error: "Usuario no encontrado" });

        const usuarioEstudiante = results[0];
        const hashedPasswordEstudiante =
          usuarioEstudiante.ClaveUsuarioEstudiante;

        if (password === hashedPasswordEstudiante) {
          const estudianteQuery =
            "SELECT NombresEstudiante, ApellidoPaternoEstudiante FROM estudiante WHERE IdEstudiante = ?";
          db.query(
            estudianteQuery,
            [usuarioEstudiante.IdEstudiante],
            (err, estudianteResults) => {
              if (err) return res.status(500).json({ error: "Database error" });

              const estudiante = estudianteResults[0];
              const initials = `${estudiante.NombresEstudiante.charAt(
                0
              )}${estudiante.ApellidoPaternoEstudiante.charAt(
                0
              )}`.toUpperCase();

              console.log("Login response for student user:", { initials });

              return res.json({
                message: "Login exitoso",
                idPersonal: usuarioEstudiante.IdEstudiante,
                user: usuarioEstudiante.AbreviaturaUsuarioEstudiante,
                initials,
                IdRolUsuario: usuarioEstudiante.IdRolUsuario, // Asegúrate de incluir el rol del usuario
              });
            }
          );
        } else {
          return res.status(401).json({ error: "Contraseña incorrecta" });
        }
      });
    }
  });
});

//RUTA PARA TRAER LOS CUESTIONARIOS DE SOLAMENTE AUTOEVALUACION CON SU PERIODOLECTIVO SELECCIONADO
app.get("/api/cuestionario-pares-eval", (req, res) => {
  const sql = `
     SELECT 
        i.idInstrumento,
        i.idPeriodoLectivo,
        CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta
    FROM
        instrumentos i
    JOIN 
        periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    WHERE nombreInstrumento = "EVALUACION ENTRE PARES"
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    console.log("Cuestionarios fetched:", data); // Log the data for debugging
    res.json(data);
  });
});

// Ruta para validar si el docente ya ha sido evaluado con el cuestionario seleccionado
app.get(
  "/api/validate-pares-eval/:idInstrumento/:idDocente/:idEvaluador/:idCarrera/:idAsignatura/:idParalelo",
  (req, res) => {
    const {
      idInstrumento,
      idDocente,
      idEvaluador,
      idCarrera,
      idAsignatura,
      idParalelo,
    } = req.params;

    const sql = `
    SELECT ejecucionStatus 
    FROM pares_eval 
    WHERE idInstrumento = ? 
    AND idEvaluado = ?
    AND idEvaluador = ?
    AND idCarrera = ?
    AND idAsignatura = ?
    AND idParalelo = ?
  `;

    db.query(
      sql,
      [
        idInstrumento,
        idDocente,
        idEvaluador,
        idCarrera,
        idAsignatura,
        idParalelo,
      ],
      (err, result) => {
        if (err) {
          console.error("Error fetching evaluation status:", err);
          return res.status(500).send("Error fetching evaluation status");
        }
        if (result.length > 0) {
          res.json({ ejecucionStatus: result[0].ejecucionStatus });
        } else {
          res.json({ ejecucionStatus: 0 });
        }
      }
    );
  }
);

//ENVIAR DATOS CABECERA PARES EVAL
// Ruta para insertar los datos del formulario en auto_eval y devolver el idEvaluacion
app.post("/api/pares_eval", (req, res) => {
  const {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    idAsignatura,
    idParalelo,
    estadoEvaluacion,
  } = req.body;

  console.log("Received data:", {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    idAsignatura,
    idParalelo,
    estadoEvaluacion,
  });

  const sql = `
    INSERT INTO pares_eval (
      idInstrumento, idEvaluador, idEvaluado, idCarrera, idAsignatura, idParalelo, estadoEvaluacion, usuarioGraba, usuarioModifica
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'usuarioGraba', 'usuarioModifica')
  `;

  db.query(
    sql,
    [
      idInstrumento,
      idEvaluador,
      idEvaluado,
      idCarrera,
      idAsignatura,
      idParalelo,
      estadoEvaluacion,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      const idParesEvaluacion = result.insertId;
      console.log("Inserted idParesEvaluacion:", idParesEvaluacion);
      res.status(200).json({ idParesEvaluacion });
    }
  );
});

// Ruta para insertar los detalles de la evaluación
// Ruta para insertar los datos del formulario en auto_eval y devolver el idEvaluacion
// Add this route handler to your Express server
// Add this route handler to your Express server
app.post("/api/det_pares_eval", (req, res) => {
  const { idEvaluacion, respuestas } = req.body;

  console.log("Received data:", { idEvaluacion, respuestas }); // Logging incoming data

  if (!idEvaluacion || !respuestas) {
    console.error("Missing required fields:", { idEvaluacion, respuestas });
    return res.status(400).send("Missing required fields");
  }

  const values = respuestas.map((respuesta) => [
    idEvaluacion,
    respuesta.idPregunta,
    respuesta.idOpcion,
    respuesta.valorOpcion,
    "usuarioGraba",
    "usuarioModifica",
  ]);

  const sql = `
    INSERT INTO det_pares_eval (
      idParesEvaluacion, idPregunta, idOpcion, valorOpcion, usuarioGraba, usuarioModifica
    ) VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).send("Data inserted successfully");
  });
});

// RUTA PARA TRAER LOS PERIODOS ACADEMICOS BASADOS EN EL IDPERIODOLECTIVO
// RUTA PARA TRAER LOS PERIODOS ACADEMICOS BASADOS EN EL IDPERIODOLECTIVO
// Existing endpoint for fetching academic periods
app.get("/api/periodo-academico/:idPeriodoLectivo", (req, res) => {
  const idPeriodoLectivo = req.params.idPeriodoLectivo;
  console.log(
    "Fetching periodos academicos for idPeriodoLectivo:",
    idPeriodoLectivo
  );

  const sql = `
    SELECT DISTINCT d.IdPeriodoAcademico, p.NombrePeriodoAcademico
    FROM distributivo d
    JOIN periodoacademico p ON d.IdPeriodoAcademico = p.IdPeriodoAcademico
    WHERE d.IdPeriodoLectivo = ?;
  `;

  db.query(sql, [idPeriodoLectivo], (err, data) => {
    if (err) {
      console.error("Error fetching periodos academicos:", err);
      return res.status(500).send("Error fetching periodos academicos");
    }
    console.log("Fetched periodos academicos:", data);
    res.json(data);
  });
});

// Nueva ruta para traer los docentes asociados a un cuestionario
// app.get("/api/docentes-cuestionario/:idCuestionario/:idEstudiante", (req, res) => {
//   const idCuestionario = req.params.idCuestionario;
//   const idEstudiante = req.params.idEstudiante;

//   // Obtener el idPeriodoLectivo del estudiante
//   const sqlPeriodoLectivo = `
//     SELECT IdPeriodoLectivo
//     FROM matricula
//     WHERE IdEstudiante = ? AND EstadoMatricula = 'M'
//     ORDER BY IdPeriodoLectivo DESC
//     LIMIT 1
//   `;

//   db.query(sqlPeriodoLectivo, [idEstudiante], (err, results) => {
//     if (err) {
//       console.error("Error fetching periodo lectivo:", err);
//       return res.status(500).send("Error fetching periodo lectivo");
//     }

//     if (results.length === 0) {
//       return res.status(404).send("No periodo lectivo found for the student");
//     }

//     const idPeriodoLectivo = results[0].IdPeriodoLectivo;

//     // Obtener los docentes basados en el idPeriodoLectivo
//     const sqlDocentes = `
//       SELECT DISTINCT
//         m.IdCarrera,
//         m.IdPeriodoLectivo,
//         m.IdPeriodoAcademico,
//         m.ParaleloMatricula,
//         m.EstadoMatricula,
//         d.IdDocente,
//         CONCAT(p.ApellidosPersonal, ' ', p.NombresPersonal) AS NombreCompleto
//       FROM
//         matricula m
//       JOIN
//         distributivo d
//         ON m.IdCarrera = d.IdCarrera
//         AND m.IdPeriodoLectivo = d.IdPeriodoLectivo
//         AND m.IdPeriodoAcademico = d.IdPeriodoAcademico
//         AND m.ParaleloMatricula = d.Paralelo
//       JOIN
//         personal p
//         ON d.IdDocente = p.IdPersonal
//       WHERE
//         m.IdEstudiante = ?
//         AND m.EstadoMatricula = 'M'
//         AND m.IdPeriodoLectivo = ?;
//     `;

//     db.query(sqlDocentes, [idEstudiante, idPeriodoLectivo], (err, data) => {
//       if (err) {
//         console.error("Error fetching data:", err);
//         return res.status(500).send("Error fetching data");
//       }
//       res.json(data);
//     });
//   });
// });

//RUTA PARA TRAER LOS CUESTIONARIOS DE SOLAMENTE HETERO EVAL CON SU PERIODOLECTIVO SELECCIONADO
app.get("/api/cuestionario-heteroeval", (req, res) => {
  const sql = `
     SELECT 
        i.idInstrumento,
        i.idPeriodoLectivo,
        CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta
    FROM
        instrumentos i
    JOIN 
        periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    WHERE nombreInstrumento = "EVALUACION ESTUDIANTES - DOCENTES"
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

app.post("/api/hetero_eval", (req, res) => {
  const {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    idAsignatura,
    idPeriodoLectivo,
    idPeriodoAcademico,
    idParalelo,
    estadoEvaluacion,
  } = req.body;

  const sql = `
    INSERT INTO hetero_eval (
      idInstrumento, idEvaluador, idEvaluado, idCarrera, idAsignatura, 
      idPeriodoLectivo, idPeriodoAcademico, idParalelo, estadoEvaluacion, 
      ejecucionStatus, usuarioGraba, usuarioModifica
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usuarioGraba', 'usuarioModifica')
  `;

  db.query(
    sql,
    [
      idInstrumento,
      idEvaluador,
      idEvaluado,
      idCarrera,
      idAsignatura,
      idPeriodoLectivo,
      idPeriodoAcademico,
      idParalelo,
      estadoEvaluacion,
      1, // Establecer ejecucionStatus a 1
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      const idHeteroEval = result.insertId;
      res.status(200).json({ idHeteroEval });
    }
  );
});

app.get("/api/matricula/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT IdCarrera as idCarrera, IdPeriodoAcademico as idPeriodoAcademico, ParaleloMatricula as paraleloMatricula
    FROM matricula
    WHERE IdEstudiante = ? AND EstadoMatricula = 'M'
    ORDER BY IdPeriodoLectivo DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) {
      console.error("Error fetching matricula data:", err);
      return res.status(500).send("Error fetching matricula data");
    }
    if (data.length === 0) {
      return res.status(404).send("No matricula data found for the student");
    }
    res.json(data[0]);
  });
});

app.get(
  "/api/asignaturas-docente/:idDocente/:idCarrera/:idPeriodoAcademico",
  (req, res) => {
    const { idDocente, idCarrera, idPeriodoAcademico } = req.params;
    const sql = `
    SELECT DISTINCT a.IdAsignatura, a.NombreAsignatura
    FROM asignatura a
    JOIN distributivo d ON a.IdAsignatura = d.IdAsignatura
    WHERE d.IdDocente = ?
      AND d.IdCarrera = ?
      AND d.IdPeriodoAcademico = ?
      AND d.EstadoDistributivo = 'A'
  `;

    db.query(sql, [idDocente, idCarrera, idPeriodoAcademico], (err, data) => {
      if (err) {
        console.error("Error fetching asignaturas:", err);
        return res.status(500).send("Error fetching asignaturas");
      }

      res.json(data);
    });
  }
);

app.post("/api/det_hetero_eval", (req, res) => {
  const { idEvaluacion, respuestas, usuarioGraba, usuarioModifica } = req.body;

  if (!idEvaluacion || !respuestas || !usuarioGraba || !usuarioModifica) {
    return res.status(400).send("Missing required fields");
  }

  const values = respuestas.map((respuesta) => [
    idEvaluacion,
    respuesta.idPregunta,
    respuesta.idOpcion,
    respuesta.valorOpcion,
    usuarioGraba,
    usuarioModifica,
  ]);

  const sql = `
    INSERT INTO det_hetero_eval (
      idHeteroEval, idPregunta, idOpcion, valorOpcion, usuarioGraba, usuarioModifica
    ) VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).send("Data inserted successfully");
  });
});

// Nueva ruta para traer los docentes asociados a un cuestionario
app.get(
  "/api/docentes-cuestionario/:idCuestionario/:idEstudiante",
  (req, res) => {
    const idCuestionario = req.params.idCuestionario;
    const idEstudiante = req.params.idEstudiante;

    const sqlPeriodoLectivo = `
    SELECT IdPeriodoLectivo 
    FROM matricula 
    WHERE IdEstudiante = ? AND EstadoMatricula = 'M'
    ORDER BY IdPeriodoLectivo DESC 
    LIMIT 1
  `;

    db.query(sqlPeriodoLectivo, [idEstudiante], (err, results) => {
      if (err) {
        console.error("Error fetching periodo lectivo:", err);
        return res.status(500).send("Error fetching periodo lectivo");
      }

      if (results.length === 0) {
        return res.status(404).send("No periodo lectivo found for the student");
      }

      const idPeriodoLectivo = results[0].IdPeriodoLectivo;

      const sqlDocentes = `
      SELECT DISTINCT
        m.IdCarrera,
        m.IdPeriodoLectivo,
        m.IdPeriodoAcademico,
        m.ParaleloMatricula,
        m.EstadoMatricula,
        d.IdDocente,
        CONCAT(p.ApellidosPersonal, ' ', p.NombresPersonal) AS NombreCompleto,
        CASE
          WHEN he.ejecucionStatus = 1 THEN 'Evaluado'
          ELSE 'No Evaluado'
        END AS estadoEvaluacion,
        he.ejecucionStatus
      FROM 
        matricula m
      JOIN 
        distributivo d 
        ON m.IdCarrera = d.IdCarrera 
        AND m.IdPeriodoLectivo = d.IdPeriodoLectivo 
        AND m.IdPeriodoAcademico = d.IdPeriodoAcademico 
        AND m.ParaleloMatricula = d.Paralelo
      JOIN 
        personal p 
        ON d.IdDocente = p.IdPersonal
      LEFT JOIN 
        hetero_eval he 
        ON he.idEvaluado = d.IdDocente
        AND he.idEvaluador = m.IdEstudiante
        AND he.idInstrumento = ?
      WHERE 
        m.IdEstudiante = ? 
        AND m.EstadoMatricula = 'M'
        AND m.IdPeriodoLectivo = ?
    `;

      db.query(
        sqlDocentes,
        [idCuestionario, idEstudiante, idPeriodoLectivo],
        (err, data) => {
          if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).send("Error fetching data");
          }
          console.log(
            "Filtered Docentes with estadoEvaluacion and ejecucionStatus:",
            data
          ); // Verifica los datos filtrados
          res.json(data);
        }
      );
    });
  }
);

// RUTA PARA TRAER LOS DOCENTES DEL COORDINADOR
// RUTA PARA TRAER LOS DOCENTES DEL COORDINADOR BASADO EN EL CUESTIONARIO SELECCIONADO
// RUTA PARA TRAER LOS DOCENTES DEL COORDINADOR BASADO EN EL CUESTIONARIO SELECCIONADO

app.get("/api/cuestionario-coord-doc-eval", (req, res) => {
  const sql = `
     SELECT 
        i.idInstrumento,
        i.idPeriodoLectivo,
        CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta
    FROM
        instrumentos i
    JOIN 
        periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    WHERE nombreInstrumento = "EVALUACION COORDINADOR - DOCENTE"
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

// Ruta para validar si el docente ya ha sido evaluado con el cuestionario seleccionado por un evaluador específico
// Ruta para validar si el docente ya ha sido evaluado con el cuestionario seleccionado por un evaluador específico
// Ruta para validar si el docente ya ha sido evaluado con el cuestionario, paralelo y asignatura seleccionados por un evaluador específico
app.get(
  "/api/validate-coord-doc-eval/:idInstrumento/:idDocente/:idEvaluador/:idParalelo/:idAsignatura",
  (req, res) => {
    const { idInstrumento, idDocente, idEvaluador, idParalelo, idAsignatura } =
      req.params;

    const sql = `
    SELECT ejecucionStatus 
    FROM coord_doc_eval 
    WHERE idInstrumento = ? 
    AND idEvaluado = ?
    AND idEvaluador = ?
    AND idParalelo = ?
    AND idAsignatura = ?
  `;

    db.query(
      sql,
      [idInstrumento, idDocente, idEvaluador, idParalelo, idAsignatura],
      (err, result) => {
        if (err) {
          console.error("Error fetching evaluation status:", err);
          return res.status(500).send("Error fetching evaluation status");
        }
        if (result.length > 0) {
          res.json({ ejecucionStatus: result[0].ejecucionStatus });
        } else {
          res.json({ ejecucionStatus: 0 });
        }
      }
    );
  }
);

app.get("/api/docentes-coordinador", (req, res) => {
  const { idRolUsuario, idPersonal, idInstrumento } = req.query;

  // Consulta para obtener el IdPeriodoLectivo del cuestionario
  const getPeriodoLectivoQuery = `
    SELECT idPeriodoLectivo
    FROM instrumentos
    WHERE idInstrumento = ?
    LIMIT 1;
  `;

  db.query(getPeriodoLectivoQuery, [idInstrumento], (error, results) => {
    if (error) {
      console.error("Error fetching idPeriodoLectivo:", error);
      return res.status(500).send("Error fetching idPeriodoLectivo");
    }

    const idPeriodoLectivo = results[0].idPeriodoLectivo;

    // Consulta para obtener los docentes
    const query = `
      SELECT DISTINCT
          u.IdPersonal,
          u.NombreUsuario,
          p.ApellidosPersonal,
          p.NombresPersonal,
          d.IdCarrera
      FROM 
          usuario u
      JOIN 
          personal p ON u.IdPersonal = p.IdPersonal
      JOIN 
          distributivo d ON p.IdPersonal = d.IdDocente
      JOIN 
          asignatura a ON d.IdAsignatura = a.IdAsignatura
      JOIN 
          periodoacademico pa ON d.IdPeriodoAcademico = pa.IdPeriodoAcademico
      JOIN 
          periodolectivo pl ON d.IdPeriodolectivo = pl.IdPeriodolectivo
      WHERE 
          d.IdCarrera = (
              SELECT 
                  d2.IdCarrera
              FROM 
                  usuario u2
              JOIN 
                  personal p2 ON u2.IdPersonal = p2.IdPersonal
              JOIN 
                  distributivo d2 ON p2.IdPersonal = d2.IdDocente
              WHERE 
                  u2.IdRolUsuario = ?
                  AND u2.IdPersonal = ?
              LIMIT 1
          )
          AND d.IdPeriodoLectivo = ?
          AND u.IdRolUsuario != 6;
    `;

    db.query(
      query,
      [idRolUsuario, idPersonal, idPeriodoLectivo],
      (error, results) => {
        if (error) {
          console.error("Error fetching docentes data:", error);
          return res.status(500).send("Error fetching docentes data");
        }
        res.json(results);
      }
    );
  });
});

//Ruta para traer los paralelos Coordinador - Docente Evaluacion
app.get(
  "/api/paralelos-docente-coorddoc/:idDocente/:idCarrera/:idPeriodoLectivo/:idPeriodoAcademico",
  (req, res) => {
    const { idDocente, idCarrera, idPeriodoLectivo, idPeriodoAcademico } =
      req.params;

    // Log the parameters received
    console.log("Fetching paralelos with params:", {
      idDocente,
      idCarrera,
      idPeriodoLectivo,
      idPeriodoAcademico,
    });

    const sql = `
    SELECT DISTINCT p.idParalelo, p.DescripParalelo
    FROM distributivo d
    JOIN paralelo p ON d.Paralelo = p.idParalelo
    WHERE 
      d.IdDocente = ? AND 
      d.IdCarrera = ? AND 
      d.IdPeriodoLectivo = ? AND 
      d.IdPeriodoAcademico = ? AND 
      d.EstadoDistributivo = 'A'
  `;

    db.query(
      sql,
      [idDocente, idCarrera, idPeriodoLectivo, idPeriodoAcademico],
      (err, data) => {
        if (err) {
          console.error("Error fetching paralelos:", err);
          return res.status(500).send("Error fetching paralelos");
        }
        console.log("Fetched paralelos data:", data); // Log the fetched data
        res.json(data);
      }
    );
  }
);

//RUTA PARA CREAR CABECERA COORD DOC
app.post("/api/coord_doc_eval", (req, res) => {
  const {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    idAsignatura,
    idPeriodoLectivo,
    idPeriodoAcademico,
    idParalelo,
    estadoEvaluacion,
  } = req.body;

  const sql = `
    INSERT INTO coord_doc_eval (
      idInstrumento, idEvaluador, idEvaluado, idCarrera, idAsignatura, 
      idPeriodoLectivo, idPeriodoAcademico, idParalelo, estadoEvaluacion, 
      ejecucionStatus, usuarioGraba, usuarioModifica
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usuarioGraba', 'usuarioModifica')
  `;

  db.query(
    sql,
    [
      idInstrumento,
      idEvaluador,
      idEvaluado,
      idCarrera,
      idAsignatura,
      idPeriodoLectivo,
      idPeriodoAcademico,
      idParalelo,
      estadoEvaluacion,
      1, // Establecer ejecucionStatus a 1
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      const idCoordDocEval = result.insertId;
      res.status(200).json({ idCoordDocEval }); // Ensure this key is correctly returned
    }
  );
});

//RUTA PARA CREAR REGISTROS DET COORD DOC EVAL

app.post("/api/det_coord_doc_eval", (req, res) => {
  const { idEvaluacion, respuestas } = req.body;

  // Check if required fields are present
  if (!idEvaluacion || !respuestas || !Array.isArray(respuestas)) {
    console.error("Missing required fields:", { idEvaluacion, respuestas });
    return res.status(400).send("Missing required fields");
  }

  // Prepare values for SQL query
  const values = respuestas.map((respuesta) => [
    idEvaluacion,
    respuesta.idPregunta,
    respuesta.idOpcion,
    respuesta.valorOpcion,
    "usuarioGraba",
    "usuarioModifica",
  ]);

  // SQL query to insert data
  const sql = `
    INSERT INTO det_coord_doc_eval (
      idCoordDocEval, idPregunta, idOpcion, valorOpcion, usuarioGraba, usuarioModifica
    ) VALUES ?
  `;

  // Execute the query
  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).send("Data inserted successfully");
  });
});

//TRAER CUESTIONARIOS SOLO RECTORADO COORDINADORES
app.get("/api/cuestionario-rectorado-coord", (req, res) => {
  const sql = `
     SELECT 
        i.idInstrumento,
        i.idPeriodoLectivo,
        CONCAT(i.nombreInstrumento, ' - ', p.DescripPeriodoLect) AS DescripCompleta
    FROM
        instrumentos i
    JOIN 
        periodolectivo p ON i.idPeriodoLectivo = p.idPeriodoLectivo
    WHERE nombreInstrumento = "EVALUACION RECTORADO - COORDINADORES"
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error al traer los datos: ", err);
      return res.status(500).send("Error al traer datos");
    }
    res.json(data);
  });
});

//TRAER COORDINADORES DIRECTIVOS EVALUACION
app.get("/api/coordinadores", (req, res) => {
  const idInstrumento = req.query.idInstrumento; // Ensure you pass this parameter from the frontend
  const userId = req.query.userId; // Ensure you pass this parameter from the frontend

  const sql = `
    SELECT 
        p.NombresPersonal AS NombreCoordinador,
        p.ApellidosPersonal AS ApellidoCoordinador,
        p.idPersonal,
        p.idCoordinadorCarrera,
        CONCAT(c.NombreCarrera, ' - ', c.SiglaCarrera) AS CarreraYsigla,
        CASE
          WHEN dce.ejecucionStatus = 1 THEN 'Evaluado'
          ELSE 'No Evaluado'
        END AS estadoEvaluacion,
        dce.ejecucionStatus
    FROM 
        carrera c
    INNER JOIN 
        personal p ON c.IdCarrera = p.idCoordinadorCarrera
    LEFT JOIN 
        direct_coord_eval dce ON dce.idEvaluado = p.IdPersonal
        AND dce.idEvaluador = ?
        AND dce.idInstrumento = ?
    WHERE 
        p.CoordinadorCarrera = 'S';
  `;

  db.query(sql, [userId, idInstrumento], (err, data) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }
    res.json(data);
  });
});

app.post("/api/direct_coord_eval", (req, res) => {
  const {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    ejecucionStatus = 1, // Set default to 1
    estadoEvaluacion = "A", // Set default to 'A'
    usuarioGraba,
  } = req.body;

  console.log("Received data:", {
    idInstrumento,
    idEvaluador,
    idEvaluado,
    idCarrera,
    ejecucionStatus,
    estadoEvaluacion,
    usuarioGraba,
  });

  const sql = `
    INSERT INTO direct_coord_eval (
      idInstrumento, idEvaluador, idEvaluado, idCarrera, ejecucionStatus, estadoEvaluacion, usuarioGraba
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      idInstrumento,
      idEvaluador,
      idEvaluado,
      idCarrera,
      ejecucionStatus,
      estadoEvaluacion,
      usuarioGraba,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err); // Detailed error log
        return res.status(500).send("Error inserting data: " + err.message);
      }
      const idDirectCoordEval = result.insertId;
      res.status(200).json({ idDirectCoordEval });
    }
  );
});

app.post("/api/det_direct_coord_eval", (req, res) => {
  const { idDirectCoordEval, respuestas, usuarioGraba } = req.body;

  const values = respuestas.map((respuesta) => [
    idDirectCoordEval,
    respuesta.idPregunta,
    respuesta.idOpcion,
    respuesta.valorOpcion,
    usuarioGraba,
  ]);

  const sql = `
    INSERT INTO det_direct_coord_eval (
      idDirectCoordEval, idPregunta, idOpcion, valorOpcion, usuarioGraba
    ) VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data: " + err.message);
    }
    res.status(200).send("Data inserted successfully");
  });
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
