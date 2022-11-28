// ! TODOS

/**
 * GET - получить данные
 * PATCH - частичное изменение
 * PUT - полная замена данных
 * POST - добавление данных
 * DELETE - удаление
 *
 * CRUD - Create(POST-request) Read(GET-request) Update(PUT/PATCH) Delete(DELETE)
 */

// npx json-server -w db.json -p 8000

// API - Applicaion programming interface
// ? npm i -g json-server

const API = "http://localhost:8000/todos";

// получаем нужные для добавления элементы
let inpAdd = document.getElementById("inp-add");
let btnAdd = document.getElementById("btn-add");

let inpSearch = document.getElementById("inp-search");
// console.log(inp);
// console.log(inpAdd, btnAdd);

// ! Create

// навесили событие на кнопку "сохранить"
btnAdd.addEventListener("click", async () => {
  // собираем объект для добавления в дб.жсон
  let newTodo = {
    todo: inpAdd.value,
  };
  //   console.log(newTodo);

  // проверка на заполненность инпута и останавливаем код с помощью return, чтоб пост-запрос не выполнился
  if (newTodo.todo.trim() === "") {
    alert("Заполните поле!");
    return;
  }
  // запрос для добавления
  await fetch(API, {
    method: "POST", // указываем метод
    body: JSON.stringify(newTodo), // указываем что именно нужно запостить
    headers: {
      "Content-type": "application/json; charset=utf-8",
    }, // кодировка
  });
  // очищаем инпут после добавления
  inpAdd.value = "";
  // чтоб добавленный таск сразу отобразился в листе вызываем функцию, которая выполняет отображение
  getTodos();
});

//? вызываем функцию, чтоб как только откроется страница что-то было отображено
let page = 1;

getTodos();

// ! READ
// ! Search
inpSearch.addEventListener("input", () => {
  // console.log("INPUT");
  getTodos();
});

// ! Pagination
let pagination = document.getElementById("pagination");
// console.log(pagination);

// получаем элемент, чтоб в нем отобразить все таски
let list = document.getElementById("list");

// console.log(list);

// функция для получения всех тасков и отображения их в div#list
// async await нужен здесь, чтоб при отправке запроса мы сначала получили данные и только потом записали все в переменную response, иначе (если мы НЕ дождемся) туда запишется pending (состояние промиса, который еще не выполнен)

async function getTodos() {
  let limit = 3;
  let response = await fetch(
    `${API}?q=${inpSearch.value}&_page=${page}&_limit=${limit}`
  )
    // если не указать метод запроса, то по умолчанию это GET запрос
    .then((res) => res.json()); // переводим все в json формат

  let allTodos = await fetch(API)
    .then((res) => res.json())
    .catch((e) => console.log(e));
  // console.log(allTodos);

  let lastPage = Math.ceil(allTodos.length / 3);
  console.log(lastPage);

  //очищаем div#list, чтоб список тасков корректно отображался и не хранил там предыдущие html-элементы со старыми данными
  list.innerHTML = "";

  //перебираем полученный из дб.жсон массив и для каждого объекта из этого массива создаем div и задаем ему содержимое через метод innerHTML, каждый созданный элемент аппендим в div#list
  response.forEach((item) => {
    let newElem = document.createElement("div");
    newElem.id = item.id;
    newElem.innerHTML = `
        <span>${item.todo}</span>
        <button class="btn-delete">Delete</button>
        <button class="btn-edit">Edit</button>
    `;
    list.append(newElem);
    // console.log(newElem);
  });

  // добовляем пагинацию
  pagination.innerHTML = `
   <button ${page === 1 ? "disabled" : ""} id="btn-prev">Назад</button>
   <span>${page}</span>
   <button ${page === lastPage ? "disabled" : ""} id="btn-next">Вперед</button>
  `;
}

document.addEventListener("click", async (e) => {
  // ! Delete
  if (e.target.className === "btn-delete") {
    // запрос для удаления
    let id = e.target.parentNode.id;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });
    getTodos();
  }

  //   ! Update
  if (e.target.className === "btn-edit") {
    modalEdit.style.display = "flex";
    let id = e.target.parentNode.id;
    // запрос для получения данных чтоб мы могли отобразить все в модалке для редактирования

    let response = await fetch(`${API}/${id}`)
      .then((res) => res.json())
      .catch((err) => console.log(err));
    // полученные данные отображаем в инпуте из хтмл

    inpEditTodo.value = response.todo;
    inpEditTodo.className = response.id; // добавляем id тудушки в класс для того чтобы получить id  в другой функции
  }

  // ! Paginate
  if (e.target.id === "btn-next") {
    page++;
    getTodos();
  }
  if (e.target.id === "btn-prev") {
    page--;
    getTodos();
  }
});

// элементы из модалки для редактирования
let modalEdit = document.getElementById("modal-edit");
let modalEditClose = document.getElementById("modal-edit-close");
let inpEditTodo = document.getElementById("inp-edit-todo");
let btnSaveEdit = document.getElementById("btn-save-edit");

// console.log(modalEdit, modalEditClose, inpEditTodo, btnSaveEdit);

// ф-я для сохранения изменений при редактировании
btnSaveEdit.addEventListener("click", async () => {
  // объект с отредактированными данными
  let editedTodo = {
    todo: inpEditTodo.value,
  };
  let id = inpEditTodo.className; // получаем id тудушки из класса этого тега
  // запрос для изменения данных
  await fetch(`${API}/${id}`, {
    method: "PATCH", // указываем метод
    body: JSON.stringify(editedTodo), // указываем что именно нужно запостить
    headers: {
      "Content-type": "application/json; charset=utf-8", // кодировка
    },
  });
  // после изменения закрываем модалку для эдит
  modalEdit.style.display = "none";
  getTodos();
});

// ф-я чтоб закрыть модалку
modalEditClose.addEventListener("click", function () {
  modalEdit.style.display = "none";
});
