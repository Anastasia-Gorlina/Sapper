
window.addEventListener('DOMContentLoaded', () => {

	/* --------------------------------------Создание счетчиков, минного поля и мин--------------------------------------------------- */

	// Инициализация счетчиков
	const mine = 16;
	let flags = 0;
	let victory = false;
	const FIELD_SIZE = 14;
    const TOTAL_MINES = 16;

	// Функция создания и запуску игры
	function createGame() {
		createArea();
		createMines();
		showCount();
		startGame();
	}

	// Функция для создания минного поля
	function createArea() {
		const table = document.createElement('table'),
			tbody = document.createElement('tbody');

		let count = 1;

		for (let i = 0; i < FIELD_SIZE; i++) {
			const tr = document.createElement('tr');
			tbody.append(tr);

			for (let g = 0; g < 14; g++) {
				const td = document.createElement('td');
				td.setAttribute("data-mine", false);
				td.setAttribute("id", count);
				count++;
				tr.append(td);
			}
		}

		table.append(tbody);
		document.querySelector('.game').append(table);
	}

	// Функция для создания 10 мин
	function createMines() {
		const cell = document.querySelectorAll('td');
		const randomCells = [];

		let count = 0;
		while (count < TOTAL_MINES) {
			let randomCell = cell[Math.round(Math.random() * cell.length)];

			if (!randomCells.includes(randomCell)) {
				randomCell.setAttribute("data-mine", true);
				randomCells.push(randomCell);
				count++;
			  }
		}
	}

	// Функция отображения счета
	function showCount() {
		const countMines = document.querySelector('.countMines');
		const countFlags = document.querySelector('.countFlags');

		countMines.textContent = mine;
		countFlags.textContent = flags;
	}
	function addButtonNewGame() {
		if (!document.querySelector('.victoryOrLoss button')) {
			const buttonNewGame = document.createElement('button');
			buttonNewGame.classList.add('buttonNewGame');
			document.querySelector('.victoryOrLoss').append(buttonNewGame);

			// Обработчик для кнопки "Начать игру заново"
			buttonNewGame.addEventListener('click', event => {
				document.querySelector('.game table').remove();
				document.querySelector('.victoryOrLoss').textContent = "";
				flags = 0;
				victory = false;
				createGame();
			})
		}
	}

	function startGame() {
		// Добавляем обработчики событий на клики мыши

		document.querySelector('tbody').addEventListener('click', openCell);	// Обработчик события "клик" ЛКМ
		document.querySelector('tbody').addEventListener('contextmenu', addRemoveFlag);	// Обработчик события "клик" ПКМ

		// Функция для события "клик" ЛКМ - "открытия" ячеек
		function openCell(event) {
			addButtonNewGame();

			const hasMine = event.target.getAttribute("data-mine") === 'true';
  				if (event.target.getAttribute("data-mine") === 'false') {
    				showEmptyCell(event.target)
    				removeFlag(event);
    				countMineNeighbors(event.target);
  				} else {
    				removeFlag(event);
    				showMine(event);
    				endGame();
  				}
			}

		// Функция события "клик" ПКМ - cтавим флаг ПКМ
		function addRemoveFlag(event) {
			event.preventDefault(); // Удаляем действие по-умолчанию (т.е. вызов контекстного меню)
			addButtonNewGame();

			const classCell = Array.from(event.target.classList); // Получаем массив классов ячейки

			// Если ячейка уже открыта и пустая - ничего не делать
			if (classCell.includes('emptyCell')) {
				return;
			}
			// Если на ячейке уже есть флаг - удалить
			const hasFlag = classCell.includes('flagCell');
 				if (hasFlag) {
        		    removeFlag(event);
  				} else if (flags < 10) {
					addFlag(event);
   				}
			}

		// Функция удаления флага
		function removeFlag(event) {
			// Если флаг уже установлен - удалить
			if (Array.from(event.target.classList).includes('flagCell')) {
				event.target.classList.remove('flagCell');
				flags--;
			}
			showCount();
		}
		// Функция добавления флага
		function addFlag(event) {
			// Если флаг еще не установлен - установить
			if (!(Array.from(event.target.classList).includes('flagCell'))) {
				event.target.classList.add('flagCell');
				flags++;
			}
			showCount();
		}

		// Функция показа мины, если пользователь попал на мину
		function showMine(event) {
			event.target.classList.add('mineCell'); // Добавление класса мины
			showAllMines()
		}

		// Функция показа всех мин
		let gameField = null;
		function createArea() {
			gameField = document.createElement('table') 
			const allMines = document
			.querySelectorAll('td[data-mine="true"]')
			.forEach(cell => {
			  cell.classList.remove('flagCell');
			  cell.classList.add('mineCell');
			})
		}

		// Функция для открытия пустых ячеек
		function showEmptyCell(cell) {
			cell.classList.add('emptyCell');
			countOpenEmptyCell()
		}

		// Функция подсчета открытих пустых ячеек
		function countOpenEmptyCell() {
			const allCells = document.querySelectorAll('table td');
			const allEmptyCells = document.querySelectorAll('.emptyCell');

			if (allEmptyCells.length === (allCells.length - mine)) {
				victory = true;
				endGame();
			}
		}

		// Функция проверки выиграл ли пользователь или проиграл
		function victoryOrLoss() {
			const victoryOrLoss = document.querySelector('.victoryOrLoss');
			if (victory === true) {
				victoryOrLoss.textContent = '😎'
			} else {
				victoryOrLoss.textContent = '😵'
			}
		}

		// Функция "Конец игры"
		function endGame() {
			document.querySelector('tbody').removeEventListener('click', openCell);	// Удаление обработчика события "клик" ЛКМ
			document.querySelector('tbody').removeEventListener('contextmenu', addRemoveFlag);	// Удаление обработчика события "клик" ПКМ
			victoryOrLoss();
			showAllMines();
		}

		/* -----------------------------------------Операции с соседними ячейками--------------------------------------------------------------- */

		// Функция поиска соседних ячеек
		function getNeighbors(cell, far = 1) {

			// Функция поиска индекса ячейки
			function indexOf(element) {
				return Array.prototype.slice.call(element.parentElement.children).indexOf(element);
			}

			// выбираем строку ячейки
			const row = cell.parentElement;
			// выбираем элемент, который держит все строки (обычно это <table> или <tbody>)
			const wrapper = row.parentElement;

			// находим индекс исходной ячеки
			const index = [
				indexOf(row), // индекс строки
				indexOf(cell) // индекс ячейки
			];

			// вычисляем ограничивающий "ящик"
			const bbox = [
				Math.max(index[0] - far, 0), // индекс минимальной строки
				Math.max(index[1] - far, 0), // индекс минимальной ячейки
				Math.min(index[0] + far, wrapper.children.length - 1), // индекс максимальной строки
				Math.min(index[1] + far, row.children.length - 1) // индекс максимальной ячейки
			];

			// массив с результатом
			const list = [];

			// перебираем все строки из bbox
			for (let i = bbox[0]; i < bbox[2] + 1; i++) {
				const sRow = wrapper.children.item(i);

				// в рамках каждой строки, перебираем все ячейки из bbox
				for (let j = bbox[1]; j < bbox[3] + 1; j++) {

					// если сейчас ячейка является исходной, пропускаем её
					if (i === index[0] && j === index[1]) {
						continue;
					}
					const sCell = sRow.children.item(j);
					list.push(sCell);
				}
			}
			return list;
		}

		// Функция подсчета и вывода количества мин вокруг открытой ячейкой
		function countMineNeighbors(cell) {
			let countMine = 0; // Счетчик мин

			const neighbors = getNeighbors(cell); // Массив соседних ячеек

			// Перебор соседних ячеек и проверка на наличие мины
			neighbors.forEach(elem => {
				if (elem.getAttribute('data-mine') === 'true') {
					countMine++;
				} else if (elem.getAttribute('data-mine') === 'false') {
					if (Array.from(elem.classList).includes('flagCell')) {
						return;
					}
					showEmptyCell(elem);
					emptyNeighbors(elem);
				}
			});

			// Вывод в открытой ячейке количества мин 
			cell.innerText = countMine;
		}

		// Функция подсчета и вывода количества мин вокруг соседней ячейки
		function emptyNeighbors(element) {
			element.innerText = 
			  getNeighbors(element)
			  .filter(element => element.getAttribute('data-mine') === 'true')
			  .length
		  }	
	}
	createGame();
})