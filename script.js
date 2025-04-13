let A = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
let L = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
let U = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
let P = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

function generateSymmetricMatrix(n) {
  let matrix = [];

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

        td.appendChild(input);
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function updateMatrix(matrix, elementId) {
  const table = document.getElementById(elementId);

  const cols = matrix[0].length;
  const tableWidth = 360;
  const cellSize = Math.max((tableWidth - cols - 1) / cols, 33);
  console.log(cellSize);
  const rows = table.getElementsByTagName("tr");
  //if (rows.length === 0) return;
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

function descomposicionLU(M) {
  let n = M.length;
  let l = Array.from({ length: n }, () => Array(n).fill(0)); // Matriz L
  let u = Array.from({ length: n }, () => Array(n).fill(0)); // Matriz U
  let possible = true;
  for (let i = 0; i < n && possible; i++) {
    l[i][i] = 1;
    for (let j = 0; j < n && possible; j++) {
      let auxsum = 0;
      if (i > j) {
        for (let k = 0; k < j && possible; k++) {
          auxsum += l[i][k] * u[k][j];
        }
        l[i][j] = (M[i][j] - auxsum) / u[j][j];
        possible = !isNaN(l[i][j]) && l[i][j] !== Infinity;
      } else {
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

  for (let i = 0; i < n; i++) {
    _P[i][i] = 1;
    for (let j = 0; j < n; j++) {
      _U[i][j] = M[i][j];
    }
  }
  for (let j = 0; j < n - 1; j++) {
    for (let i = j; i < n; i++) {
      if (_U[i][j] === 0) {
        if (i === j) {
          let new_i = i + 1;
          while (_U[new_i][j] === 0 && new_i + 1 < n) {
            new_i++;
          }

          if (new_i === n - 1 && _U[new_i][j] === 0) {
            break;
          }

          let tempP = _P[i];
          _P[i] = _P[new_i];
          _P[new_i] = tempP;

          let tempL = _L[i];
          _L[i] = _L[new_i];
          _L[new_i] = tempL;

          let tempU = _U[i];
          _U[i] = _U[new_i];
          _U[new_i] = tempU;

          //i--;
        }
        //continue;
      }
      if (i === j || _U[i][j] === 0) {
        continue;
      }
      let factor = _U[i][j] / _U[j][j];
      _L[i][j] = factor;
      for (let k = j; k < n; k++) {
        _U[i][k] -= factor * _U[j][k];
      }
    }
    //colEmpty = false;
  }
  for (let i = 0; i < n; i++) {
    _L[i][i] = 1;
  }
  return { _L, _U, _P };
}

function calculateMatrix() {
  updateMatrix(A, "matrix-gen");

  document.getElementById("matrix-gen").parentElement.style.display = "block";
  document.getElementById("matrixL").parentElement.style.display = "block";
  document.getElementById("matrixU").parentElement.style.display = "block";

  const { possible, l, u } = descomposicionLU(A);
  if (possible) {
    L = l;
    U = u;
    document.getElementById("matrixP").parentElement.style.display = "none";
    updateMatrix(L, "matrixL");
    updateMatrix(U, "matrixU");
  } else {
    document.getElementById("matrixP").parentElement.style.display = "block";

    const { _L, _U, _P } = descomposicionPtLU(A);
    L = _L;
    U = _U;
    P = _P;
    Pt = transpuesta(P);
    updateMatrix(L, "matrixL");
    updateMatrix(U, "matrixU");
    updateMatrix(P, "matrixP");
  }
}

document.getElementById("generate-button").addEventListener("click", () => {
  const n = parseInt(document.getElementById("n").value);
  if (n < 4 || n > 10 || isNaN(n)) return;
  A = generateSymmetricMatrix(n);
  L = Array.from({ length: n }, () => Array(n).fill(0));
  U = Array.from({ length: n }, () => Array(n).fill(0));
  P = Array.from({ length: n }, () => Array(n).fill(0));

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

let _A = [
  [0, 4, -5, 2, 8],
  [0, 0, 6, 1, 5],
  [0, 6, 1, 6, -6],
  [0, 1, 6, 3, -5],
  [0, -5, -6, -5, 0],
];
let _l = [
  [1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0.17, 0.97, 1, 0],
  [0, -0.83, -0.85, 0.84, 1],
];
let _u = [
  [0, 4, -5, 2, 8],
  [0, 6, 1, 6, -6],
  [0, 0, 6, 1, -5],
  [0, 0, 0, 1.03, 0.86],
  [0, 0, 0, 0, -10.03],
];
let _p = [
  [1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
];

console.log(multiplicarMatrices(multiplicarMatrices(_p, _l), _u));
