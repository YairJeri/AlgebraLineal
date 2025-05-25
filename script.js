// Definir las matrices A, L, U y P
let A = [];
let L = [];
let U = [];
let P = [];

let L_ant = [];
let U_ant = [];
let P_ant = [];

function generateSymmetricMatrix(n) {
  let matrix = [];
  // Generar la matriz simétrica
  for (let i = 0; i < n; i++) {
    let row = [];
    for (let j = 0; j <= i; j++) {
      let num = Math.floor(Math.random() * 20 - 10);
      row.push(num);
      if (i !== j) {
        matrix[j] = matrix[j] || [];
        matrix[j][i] = num;
      }
    }
    matrix.push(row);
  }
  return matrix;
}

function isSymmetricPositiveDefinite(A) {
  const n = A.length;
  const L_cholesky = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (A[i][j] !== A[j][i]) return { cholesky: false };

      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L_cholesky[i][k] * L_cholesky[j][k];
      }

      if (i === j) {
        const diag = A[i][i] - sum;
        console.log(diag);
        if (diag <= 0) return { cholesky: false };
        L_cholesky[i][j] = Math.sqrt(diag);
        console.log(L_cholesky[i][j]);
      } else {
        if (L_cholesky[j][j] === 0) return { cholesky: false };
        L_cholesky[i][j] = (A[i][j] - sum) / L_cholesky[j][j];
      }
    }
  }

  return { cholesky: true, l_cholesky: L_cholesky };
}

function createMatrix(matrix, elementId) {
  const table = document.getElementById(elementId);
  table.innerHTML = "";

  matrix.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach((cell, j) => {
      const td = document.createElement("td");
      if (elementId === "matrix-gen") {
        const input = document.createElement("input");
        input.type = "text";
        input.style.width = "30px";

        input.addEventListener("change", () => {
          const inputValue = parseFloat(input.value);
          if (isNaN(inputValue)) {
            input.value = cell;
          } else {
            A[i][j] = inputValue;

            calculateMatrix();
          }
        });
        input.addEventListener("focus", () => {
          input.select();
        });
        td.appendChild(input);
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function updateMatrix(matrix, matrix_ant, elementId) {
  if (matrix.length === 0) return;

  const table = document.getElementById(elementId);

  const cols = matrix[0].length;
  const tableWidth = 360 - (10 - cols) * 10;

  const windowWidth = window.innerWidth;
  const cellSize = Math.max(
    (tableWidth - cols - 1) / cols,
    (windowWidth * 0.2 - cols - 1 - (10 - cols) * 20) / cols
  );
  const rows = table.getElementsByTagName("tr");
  matrix.forEach((row, i) => {
    const cells = rows[i].getElementsByTagName("td");
    row.forEach((cell, j) => {
      let num = parseFloat(cell);
      let textContent = "";
      if (num % 1 === 0) {
        textContent = num.toString();
      } else if ((num * 10) % 1 === 0) {
        textContent = num.toFixed(1);
      } else {
        textContent = num.toFixed(2);
      }
      let newSize = Math.max(0.2, 1.2 - textContent.length * 0.1);
      if (matrix_ant[i][j] !== cell) {
        const cellEl = cells[j];
        cellEl.classList.remove("cell-updated");
        void cellEl.offsetWidth;
        cellEl.classList.add("cell-updated");
      }

      if (elementId === "matrix-gen") {
        const input = cells[j].getElementsByTagName("input")[0];
        input.value = Math.round(textContent);
        input.style.width = `${cellSize}px`;
        input.style.height = `${cellSize}px`;
        input.style.fontSize = newSize + "em";
      } else {
        cells[j].textContent = textContent;
        cells[j].style.fontSize = newSize + "em";

        cells[j].style.minWidth = `${cellSize}px`; // Aplicar el tamaño dinámico calculado
        cells[j].style.height = `${cellSize}px`;
      }
    });
  });
}

if (!window.resizeListenerAdded) {
  window.addEventListener("resize", function () {
    updateMatrix(A, A, "matrix-gen");
    updateMatrix(P, P_ant, "matrixP");
    updateMatrix(L, L_ant, "matrixL");
    updateMatrix(U, U_ant, "matrixU");
  });
  window.resizeListenerAdded = true;
}

function descomposicionLU(M) {
  let n = M.length;
  let l = Array.from({ length: n }, () => Array(n).fill(0)); // Matriz L
  let u = Array.from({ length: n }, () => Array(n).fill(0)); // Matriz U
  let possible = true; // Indica si es posible descomponer la matriz por LU

  // i: fila actual, j: columna actual
  for (let i = 0; i < n && possible; i++) {
    l[i][i] = 1; // La diagonal de la matriz L se inicializa con 1
    for (let j = 0; j < n && possible; j++) {
      let auxsum = 0;
      if (i > j) {
        // Debajo de la diagonal
        for (let k = 0; k < j && possible; k++) {
          auxsum += l[i][k] * u[k][j];
        }
        l[i][j] = (M[i][j] - auxsum) / u[j][j];
        possible = !isNaN(l[i][j]) && l[i][j] !== Infinity;
      } else {
        // Encima de la diagonal + la diagonal
        auxsum = 0;
        for (let k = 0; k < i && possible; k++) {
          auxsum += l[i][k] * u[k][j];
        }
        u[i][j] = M[i][j] - auxsum;
        possible = !isNaN(u[i][j]) && u[i][j] !== Infinity;
      }
    }
  }
  return { possible, l, u };
}

function descomposicionPtLU(M) {
  const n = M.length;
  let _P = Array.from({ length: n }, () => Array(n).fill(0));
  let _L = Array.from({ length: n }, () => Array(n).fill(0));
  let _U = Array.from({ length: n }, () => Array(n).fill(0));

  // Inicializa la matriz P con la matriz identidad
  for (let i = 0; i < n; i++) {
    _P[i][i] = 1;
    for (let j = 0; j < n; j++) {
      _U[i][j] = M[i][j]; // Inicializa la matriz U con la matriz original
    }
  }

  // i: fila actual, j: columna actual
  for (let j = 0; j < n - 1; j++) {
    for (let i = j; i < n; i++) {
      // Si el elemento es nulo y es la diagonal
      // Intentar intercambiar con el siguiente elemento no nulo en la columna
      if (_U[i][j] === 0 && i === j) {
        let new_i = i + 1;
        while (_U[new_i][j] === 0 && new_i + 1 < n) {
          new_i++; // Buscar el siguiente elemento no nulo en la columna
        }

        if (new_i === n - 1 && _U[new_i][j] === 0) {
          break; // Si no hay elementos no nulos en la columna, terminar el bucle
        }

        // En caso de que exista un elemento no nulo en la fila, intercambiar
        // la fila actual con la fila con elemento no nulo
        let tempP = _P[i];
        _P[i] = _P[new_i];
        _P[new_i] = tempP;

        let tempL = _L[i];
        _L[i] = _L[new_i];
        _L[new_i] = tempL;

        let tempU = _U[i];
        _U[i] = _U[new_i];
        _U[new_i] = tempU;
      }
      // Si estamos en la diagonal o el elemento actual es 0
      // No hacer nada y continuar al siguiente elemento en la columna
      if (i === j || _U[i][j] === 0) {
        continue;
      }

      // Calcular el factor de la fila i
      let factor = _U[i][j] / _U[j][j];
      _L[i][j] = factor;

      // Restar la fila i con el factor multiplicado por la fila j
      for (let k = j; k < n; k++) {
        _U[i][k] -= factor * _U[j][k];
      }
    }
  }

  // Despues de terminar los intercambios, completar la diagonal de la matriz L
  for (let i = 0; i < n; i++) {
    _L[i][i] = 1;
  }
  return { _L, _U, _P };
}

function calculateMatrix() {
  updateMatrix(A, A, "matrix-gen"); // Actualizar el HTML con la matriz original

  let formula = document.getElementById("matrixFormula");
  formula.style.display = "block";

  document.getElementById("matrix-gen").parentElement.style.display = "block";
  document.getElementById("matrixL").parentElement.style.display = "block";

  const { cholesky, l_cholesky } = isSymmetricPositiveDefinite(A); // Calcular descomposición LU
  if (cholesky) {
    formula.innerHTML = "A = LLᵀ";
    P = [];
    L = l_cholesky;
    document.getElementById("matrixP").parentElement.style.display = "none";
    document.getElementById("matrixU").parentElement.style.display = "none";
    updateMatrix(L, L_ant, "matrixL");
  } else {
    document.getElementById("matrixU").parentElement.style.display = "block";
    const { possible, l, u } = descomposicionLU(A); // Calcular descomposición LU
    if (possible) {
      // Si es posible descomponer la matriz por LU
      formula.innerHTML = "A = LU";
      P = [];
      L = l;
      U = u;
      document.getElementById("matrixP").parentElement.style.display = "none";
      updateMatrix(L, L_ant, "matrixL");
      updateMatrix(U, U_ant, "matrixU");
    } else {
      // Si no es posible, descomponer la matriz por PA=LU
      document.getElementById("matrixP").parentElement.style.display = "block";

      formula.innerHTML = "PA = LU";
      const { _L, _U, _P } = descomposicionPtLU(A);
      L = _L;
      U = _U;
      P = _P;
      Pt = transpuesta(P);
      updateMatrix(L, L_ant, "matrixL"); // Actualizar el HTML con la matriz L
      updateMatrix(U, U_ant, "matrixU"); // Actualizar el HTML con la matriz U
      updateMatrix(P, P_ant, "matrixP"); // Actualizar el HTML con la matriz P

      P_ant = P.map((row) => [...row]);

      //console.log(multiplicarMatrices(multiplicarMatrices(Pt, L), U));
    }
  }
  L_ant = L.map((row) => [...row]);
  U_ant = U.map((row) => [...row]);
}

document.getElementById("generate-button").addEventListener("click", () => {
  const n = parseInt(document.getElementById("n").value);
  if (n < 4 || n > 10 || isNaN(n)) return;
  A = generateSymmetricMatrix(n);
  L = Array.from({ length: n }, () => Array(n).fill(0));
  U = Array.from({ length: n }, () => Array(n).fill(0));
  P = Array.from({ length: n }, () => Array(n).fill(0));

  L_ant = Array.from({ length: n }, () => Array(n).fill(0));
  U_ant = Array.from({ length: n }, () => Array(n).fill(0));
  P_ant = Array.from({ length: n }, () => Array(n).fill(0));

  createMatrix(A, "matrix-gen");
  createMatrix(L, "matrixL");
  createMatrix(U, "matrixU");
  createMatrix(P, "matrixP");

  calculateMatrix();
});

function multiplicarMatrices(A, B) {
  let filasA = A.length;
  let columnasA = A[0].length;
  let filasB = B.length;
  let columnasB = B[0].length;

  // Verificar si las matrices pueden multiplicarse
  if (columnasA !== filasB) {
    throw new Error(
      "Las matrices no se pueden multiplicar. Las columnas de A deben ser iguales a las filas de B."
    );
  }

  // Crear la matriz resultado (con tantas filas como A y tantas columnas como B)
  let resultado = Array.from({ length: filasA }, () =>
    Array(columnasB).fill(0)
  );

  // Realizar la multiplicación de matrices
  for (let i = 0; i < filasA; i++) {
    for (let j = 0; j < columnasB; j++) {
      for (let k = 0; k < columnasA; k++) {
        resultado[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return resultado;
}
function transpuesta(matriz) {
  let filas = matriz.length;
  let columnas = matriz[0].length;

  // Crear una nueva matriz de dimensiones invertidas
  let matrizTranspuesta = Array.from({ length: columnas }, () =>
    Array(filas).fill(0)
  );

  // Llenar la matriz transpuesta
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      matrizTranspuesta[j][i] = matriz[i][j];
    }
  }

  return matrizTranspuesta;
}
