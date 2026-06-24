let estadoJogo = "explorando";
let jogoAtivo = true;
let inimigoAtual = null;
let emBatalha = false;
let bossDerrotado = false;
let jogoFinalizado = false;

const personagem = {
  nome: "Slayer",
  classe: "Mercenário",
  nivel: 2,
  forca: 10,
  arma: {
    nome: "Espada Enferrujada",
    tipo: "arma",
    forca: 1,
  },
  defesa: 10,
  armadura: null,
  vida: 100,
  vidaMaxima: 100,
  xpAtual: 0,
  xpMax: 10,
  moeda: 50,
  inventário: [
    {
      nome: "Poção de cura",
      tipo: "consumivel",
      cura: 20,
    },
  ],
  img: "img/slayer.jpeg",
};

function clamp(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}
function atualizarBotoes() {
  const buttons = document.getElementById("buttons");

  if (emBatalha) {
    buttons.innerHTML = `
            <button onclick="atacarUI()">Atacar</button>
            <button onclick="curarUI()">Cura</button>
            <button onclick="fugirUI()">Fugir</button>
        `;
  } else {
    buttons.innerHTML = `
            <button onclick="explorar()">Explorar</button>
            <button onclick="abrirLoja()">Loja</button>
            <button onclick="abrirInventario()">Inventário</button>
        `;
  }
}

function atualizarPlayerUI() {
  document.getElementById("player-name").textContent = personagem.nome;

  document.getElementById("player-portrait").src = personagem.img;

  const hpP = (personagem.vida / personagem.vidaMaxima) * 100;

  document.getElementById("hpPlayer").style.width = hpP + "%";

  document.getElementById("hpPlayerText").innerText =
    `${Math.floor(personagem.vida)} / ${personagem.vidaMaxima}`;
}

function atualizarEnemyUI(inimigo) {
  const ui = document.getElementById("enemy-ui");

  if (!inimigo) {
    ui.style.display = "none";
    return;
  }

  ui.style.display = "block";

  document.getElementById("enemy-name").textContent = inimigo.nome;

  document.getElementById("enemy-portrait").src =
    inimigo.img || "img/default.png";

  const hp = (inimigo.vida / inimigo.vidaMaxima) * 100;

  document.getElementById("enemy-hp-fill").style.width = hp + "%";

  document.getElementById("enemy-hp-text").innerText =
    `${Math.floor(inimigo.vida)} / ${inimigo.vidaMaxima}`;
}

const produtos = [
  {
    id: 1,
    nome: "Poção Pequena",
    tipo: "consumivel",
    cura: 20,
    preco: 15,
    quantidade: 10,
  },

  {
    id: 2,
    nome: "Espada de Ferro",
    tipo: "arma",
    forca: 3,
    preco: 50,
    quantidade: 2,
  },

  {
    id: 3,
    nome: "Armadura de Couro",
    tipo: "armadura",
    defesa: 2,
    preco: 40,
    quantidade: 2,
  },
];

function forcaTotal() {
  return personagem.forca + personagem.arma.forca;
}

function defesaTotal() {
  let defesaArmadura = 0;

  if (personagem.armadura) {
    defesaArmadura = personagem.armadura.defesa;
  }

  return personagem.defesa + defesaArmadura;
}

const capitulos = [
  { nome: "A Floresta Sombria", progressoatual: 0, progresso: 5 },
  { nome: "As Montanhas Geladas", progressoatual: 0, progresso: 5 },
  { nome: "A Caverna dos Trolls", progressoatual: 0, progresso: 5 },
  { nome: "A Floresta dos Ursos", progressoatual: 0, progresso: 5 },
];

let gerenciadorCapitulo = capitulos[0];

const inimigoGoblin = [
  ["Goblin", 1, 5, 30, 30, 2, "img/G.png"],
  ["Goblin Arqueiro", 1, 7, 25, 25, 1, "img/GA.png"],
  ["Goblin Mago", 1, 6, 20, 20, 1, "img/GM.png"],
];

const inimigoOrc = [
  ["Orc", 2, 8, 50, 50, 4, "img/O.png"],
  ["Orc Berserker", 2, 10, 40, 40, 3, "img/OB.png"],
  ["Orc Xamã", 2, 9, 35, 35, 3, "img/OX.png"],
];

const inimigoTroll = [
  ["Troll", 3, 12, 80, 80, 6, "img/T.png"],
  ["Troll Guerreiro", 3, 14, 70, 70, 5, "img/TG.png"],
  ["Troll Mago", 3, 13, 60, 60, 5, "img/TM.png"],
];

const inimigoUrso = [
  ["Urso", 4, 15, 100, 100, 8, "img/U.png"],
  ["Urso Berserker", 4, 18, 90, 90, 7, "img/UB.png"],
  ["Urso Alpha", 4, 17, 80, 80, 7, "img/UA.png"],
];

const chefes = {
  "A Floresta Sombria": criarInimigo(
    "Goblin Rei",
    5,
    15,
    150,
    150,
    8,
    "img/GR.png",
  ),

  "As Montanhas Geladas": criarInimigo(
    "Orc Chefe", 
    8, 
    20, 
    250, 
    250, 
    12, 
    "img/OC.png"
  ),

  "A Caverna dos Trolls": criarInimigo(
    "Troll Ancião", 
    12, 
    28, 
    400, 
    400, 
    16,
    "img/TA.png"
  ),

  "A Floresta dos Ursos": criarInimigo(
    "Urso Gigante", 
    15, 
    35, 
    600, 
    600, 
    20,
    "img/UG.png"
  ),
};

const drops = {
  //Goblin

  Goblin: [
    { nome: "Moedas", min: 3, max: 10, chance: 100, tipo: "ouro" },
    { nome: "Poção Pequena", chance: 25, tipo: "consumivel" },
    { nome: "Faca Cega", chance: 10, tipo: "arma", forca: 1 },
  ],

  "Goblin Arqueiro": [
    { nome: "Moedas", min: 5, max: 12, chance: 100, tipo: "ouro" },
    { nome: "Flechas", chance: 40, tipo: "material" },
    { nome: "Arco Simples", chance: 8, tipo: "arma", forca: 2 },
  ],

  "Goblin Mago": [
    { nome: "Moedas", min: 8, max: 15, chance: 100, tipo: "ouro" },
    { nome: "Fragmento Mágico", chance: 35, tipo: "material" },
    { nome: "Pergaminho Rasgado", chance: 15, tipo: "material" },
  ],

  "Goblin Rei": [
    { nome: "Moedas", min: 50, max: 50, chance: 100, tipo: "ouro" },
    { nome: "Coroa do Rei Goblin", chance: 15, tipo: "equipamento", defesa: 2 },
    { nome: "Espada Goblin Rara", chance: 25, tipo: "arma", forca: 5 },
  ],

  //Orc

  Orc: [
    { nome: "Moedas", min: 10, max: 20, chance: 100, tipo: "ouro" },
    { nome: "Machado Orc", chance: 20, tipo: "arma", forca: 4 },
    { nome: "Carne Curada", chance: 30, tipo: "consumivel", cura: 20 },
  ],

  "Orc Berserker": [
    { nome: "Moedas", min: 15, max: 25, chance: 100, tipo: "ouro" },
    { nome: "Machado Pesado", chance: 15, tipo: "arma", forca: 6 },
    { nome: "Poção de Vida", chance: 20, tipo: "consumivel" },
  ],

  "Orc Xamã": [
    { nome: "Moedas", min: 15, max: 30, chance: 100, tipo: "ouro" },
    { nome: "Totem Rúnico", chance: 15, tipo: "material" },
    { nome: "Poção de Cura", chance: 20, tipo: "consumivel" },
  ],

  "Orc Chefe": [
    { nome: "Moedas", min: 100, max: 100, chance: 100, tipo: "ouro" },
    { nome: "Machado do Chefe", chance: 20, tipo: "arma", forca: 8 },
    { nome: "Armadura Orc", chance: 30, tipo: "armadura", defesa: 5 },
  ],

  //Troll

  Troll: [
    { nome: "Moedas", min: 20, max: 35, chance: 100, tipo: "ouro" },
    { nome: "Couro Grosso", chance: 40, tipo: "material" },
    { nome: "Poção Média", chance: 25, tipo: "consumivel", cura: 50 },
  ],

  "Troll Guerreiro": [
    { nome: "Moedas", min: 25, max: 40, chance: 100, tipo: "ouro" },
    { nome: "Clava Pesada", chance: 20, tipo: "arma", forca: 8 },
    { nome: "Escudo Reforçado", chance: 20, tipo: "escudo", defesa: 3 },
  ],

  "Troll Mago": [
    { nome: "Moedas", min: 30, max: 50, chance: 100, tipo: "ouro" },
    { nome: "Cristal Arcano", chance: 30, tipo: "material" },
    { nome: "Grimório Antigo", chance: 10, tipo: "material" },
  ],

  "Troll Ancião": [
    { nome: "Moedas", min: 200, max: 200, chance: 100, tipo: "ouro" },
    { nome: "Núcleo Arcano", chance: 25, tipo: "material" },
    { nome: "Armadura Troll", chance: 20, tipo: "armadura", defesa: 8 },
  ],

  //Urso

  Urso: [
    { nome: "Moedas", min: 30, max: 50, chance: 100, tipo: "ouro" },
    { nome: "Pele de Urso", chance: 40, tipo: "material" },
    { nome: "Garras", chance: 20, tipo: "material" },
  ],

  "Urso Berserker": [
    { nome: "Moedas", min: 40, max: 60, chance: 100, tipo: "ouro" },
    { nome: "Pele Espessa", chance: 35, tipo: "material" },
    { nome: "Coração de Fera", chance: 15, tipo: "material" },
  ],

  "Urso Alpha": [
    { nome: "Moedas", min: 50, max: 70, chance: 100, tipo: "ouro" },
    { nome: "Presa Alpha", chance: 20, tipo: "material" },
    { nome: "Essência Selvagem", chance: 10, tipo: "material" },
  ],

  "Urso Gigante": [
    { nome: "Moedas", min: 300, max: 300, chance: 100, tipo: "ouro" },
    { nome: "Manto do Alpha", chance: 20, tipo: "armadura", defesa: 10 },
    { nome: "Machado Selvagem", chance: 15, tipo: "arma", forca: 10 },
  ],
};

function gerarDrops(inimigo) {
  const tabela = drops[inimigo.nome];

  if (!tabela) {
    return [];
  }

  const itensObtidos = [];

  for (const item of tabela) {
    const sorteio = Math.random() * 100;

    if (sorteio <= item.chance) {
      if (item.tipo === "ouro") {
        const quantidade =
          Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;

        itensObtidos.push({
          nome: item.nome,
          quantidade: quantidade,
          tipo: "ouro",
        });
      } else {
        itensObtidos.push({
          ...item,
        });
      }
    }
  }

  return itensObtidos;
}

function adicionarDropsAoInventario(itens) {
  for (const item of itens) {
    if (item.tipo === "ouro") {
      personagem.moeda += item.quantidade;

      print(`${item.quantidade} ouro ganho`);
    } else {
      personagem.inventário.push(item);

      print(`${item.nome} obtido`);
    }
  }

  atualizarHUD();
}

function criarInimigo(nome, nivel, dano, vida, vidaMaxima, defesa, img) {
  return { nome, nivel, dano, vida, vidaMaxima, defesa, img };
}

function atacar(inimigo) {
  const dado = Math.floor(Math.random() * 20) + 1;
  const danoBase = forcaTotal() + dado - (inimigo.defesa || 0);
  const danoTotal = Math.max(0, danoBase);

  if (!inimigo) return "Inimigo inválido!";

  if (dado < 5) return `O ataque de ${personagem.nome} falhou!`;
  if (danoTotal === 0) return `O ataque não causou dano!`;

  if (personagem.nivel < inimigo.nivel && dado >= 20) {
    inimigo.vida = clamp(inimigo.vida - danoTotal * 1.5, 0, inimigo.vidaMaxima);
    return `Crítico contra inimigo forte! Dano ${danoTotal * 1.5}`;
  }

  if (personagem.nivel < inimigo.nivel) {
    inimigo.vida = clamp(inimigo.vida - danoTotal * 0.5, 0, inimigo.vidaMaxima);
    return `Ataque fraco! Dano ${danoTotal * 0.5}`;
  }

  if (dado >= 18) {
    inimigo.vida = clamp(inimigo.vida - danoTotal * 2, 0, inimigo.vidaMaxima);
    return `Crítico! Dano ${danoTotal * 2}`;
  }

  inimigo.vida = clamp(inimigo.vida - danoTotal, 0, inimigo.vidaMaxima);
  return `Ataque normal! Dano ${danoTotal}`;
}

function inimigoAtacar(inimigo) {
  const dado = Math.floor(Math.random() * 20) + 1;
  const danoBase = inimigo.dano + dado - defesaTotal();
  const danoTotal = Math.max(0, danoBase);

  if (dado < 5) return `O ataque do ${inimigo.nome} falhou!`;
  if (danoTotal === 0) return `O ataque não causou dano!`;

  const danoFinal = dado >= 19 ? danoTotal * 1.5 : danoTotal;
  personagem.vida = clamp(
    personagem.vida - danoFinal,
    0,
    personagem.vidaMaxima,
  );
  atualizarBarras();

  return `O ${inimigo.nome} causou ${danoFinal} de dano`;
}

function curar() {
  if (personagem.vida >= personagem.vidaMaxima) {
    console.log("Vida já está cheia!");
    return;
  }

  personagem.vida += 20;

  if (personagem.vida > personagem.vidaMaxima) {
    personagem.vida = personagem.vidaMaxima;
  }

  console.log(`${personagem.nome} recuperou 20 HP!`);
  console.log(`Vida: ${personagem.vida}/${personagem.vidaMaxima}`);
}

function zerarVida(obj) {
  if (obj.vida < 0) obj.vida = 0;
}

function statusPersonagem() {
  if (personagem.vida <= 0) return `${personagem.nome} foi derrotado!`;
  if (personagem.vida <= 10)
    return `${personagem.nome} está crítico! Vida: ${personagem.vida}`;
  if (personagem.vida < personagem.vidaMaxima)
    return `Vida: ${personagem.vida}`;
  return `${personagem.nome} está com vida cheia!`;
}

function statusInimigo(inimigo) {
  if (inimigo.vida <= 0) return `${inimigo.nome} foi derrotado!`;
  return `${inimigo.nome}: ${inimigo.vida} HP`;
}

function levelUp(inimigo) {
  if (inimigo.vida <= 0) {
    const xpGanho = inimigo.nivel * 5;
    personagem.xpAtual += xpGanho;
    return `${personagem.nome} ganhou ${xpGanho} XP`;
  }
}

function verificarLevelUp() {
  while (personagem.xpAtual >= personagem.xpMax) {
    personagem.xpAtual -= personagem.xpMax;

    personagem.nivel++;
    personagem.forca += 5;
    personagem.defesa += 5;
    personagem.vidaMaxima += 20;
    personagem.vida = personagem.vidaMaxima;

    personagem.xpMax = Math.floor(personagem.xpMax * 1.5);

    print(
      `LEVEL UP! Nível ${personagem.nivel} | +5 FOR | +5 DEF | +20 HP`,
      "vitoria",
    );
  }

  const falta = personagem.xpMax - personagem.xpAtual;
  return `Faltam ${falta} XP para o próximo nível.`;
}

function exibirXp() {}

function sortearInimigo() {
  let lista = [];

  switch (gerenciadorCapitulo.nome) {
    case "A Floresta Sombria":
      lista = inimigoGoblin;
      break;
    case "As Montanhas Geladas":
      lista = inimigoOrc;
      break;
    case "A Caverna dos Trolls":
      lista = inimigoTroll;
      break;
    case "A Floresta dos Ursos":
      lista = inimigoUrso;
      break;
  }

  const escolhido = lista[Math.floor(Math.random() * lista.length)];
  return criarInimigo(...escolhido);
}

function spawnBoss() {
  if (inimigoAtual || jogoFinalizado) return;

  gerenciadorCapitulo.progressoatual = gerenciadorCapitulo.progresso;

  const chefeBase = chefes[gerenciadorCapitulo.nome];

  if (!chefeBase) return;

  inimigoAtual = criarInimigo(
    chefeBase.nome,
    chefeBase.nivel,
    chefeBase.dano,
    chefeBase.vidaMaxima,
    chefeBase.vidaMaxima,
    chefeBase.defesa,
    chefeBase.img,
  );

  emBatalha = true;

  atualizarEnemyUI(inimigoAtual);
  atualizarBarras();
  atualizarBotoes();
  atualizarHUD();

  print(`⚠ CHEFE: ${inimigoAtual.nome} apareceu!`, "erro");
}

function progressoCapitulo() {
  if (emBatalha || jogoFinalizado) return;

  gerenciadorCapitulo.progressoatual++;

  if (gerenciadorCapitulo.progressoatual >= gerenciadorCapitulo.progresso) {
    spawnBoss();
  }
}

let log = document.getElementById("log");
let statusUI = document.getElementById("status");

function print(texto, tipo = "normal") {
  const log = document.getElementById("log");

  let cor = "white";

  if (tipo === "vitoria") cor = "#00ff66";
  if (tipo === "erro") cor = "#ff4444";
  if (tipo === "dano") cor = "#ffcc00";

  log.innerHTML += `<span style="color:${cor}">> ${texto}</span><br>`;
  log.scrollTop = log.scrollHeight;
}

function atualizarHUD() {
  document.getElementById("status").innerHTML = `
        <b>${personagem.nome}</b> |
        LV: ${personagem.nivel} |
        XP: ${personagem.xpAtual}/${personagem.xpMax} |
        Ouro: ${personagem.moeda} 
        
    `;
}

function explorar() {
  if (emBatalha || jogoFinalizado) return;

  const inimigo = sortearInimigo();

  inimigoAtual = inimigo;
  emBatalha = true;

  atualizarEnemyUI(inimigoAtual);
  atualizarBarras();
  atualizarBotoes();

  print(`Um ${inimigo.nome} apareceu!`);
}

function atacarUI() {
  if (!emBatalha || !inimigoAtual) {
    print("Sem inimigo!");
    return;
  }

  const resultado = atacar(inimigoAtual);

  if (!resultado) {
    print("Erro no ataque!");
    return;
  }

  print(resultado);

  print(statusInimigo(inimigoAtual));
  atualizarEnemyUI(inimigoAtual);
  atualizarBarras();

  if (inimigoAtual.vida <= 0) {
    fimDeBatalha(true);
    return;
  }

  const resposta = inimigoAtacar(inimigoAtual);

  if (resposta) print(resposta);

  print(statusPersonagem());
  atualizarBarras();

  if (personagem.vida <= 0) {
    fimDeBatalha(false);
  }

  atualizarHUD();
}
function curarUI() {
  const pocao = personagem.inventário.find(
    (item) => item.tipo === "consumivel",
  );

  if (!pocao) {
    print("Você não possui poções!");
    return;
  }

  const index = personagem.inventário.indexOf(pocao);

  personagem.vida += pocao.cura;

  if (personagem.vida > personagem.vidaMaxima) {
    personagem.vida = personagem.vidaMaxima;
  }

  personagem.inventário.splice(index, 1);

  print(`Usou ${pocao.nome} (+${pocao.cura} HP)`);

  atualizarBarras();
  atualizarHUD();
}
function fugirUI() {
  if (!emBatalha) return;

  if (Math.random() < 0.7) {
    print("Você fugiu da batalha!");

    emBatalha = false;
    inimigoAtual = null;

    atualizarEnemyUI(null);
    atualizarBarras();
    atualizarBotoes();
  } else {
    print("Falhou ao fugir!");

    const resposta = inimigoAtacar(inimigoAtual);

    if (resposta) print(resposta);

    atualizarBarras();
  }
}
function fimDeBatalha(vitoria) {
  emBatalha = false;
  atualizarBotoes();

  if (!vitoria) {
    print("Game Over!", "erro");
    return;
  }

  print("Você venceu!", "vitoria");

  const xp = inimigoAtual.nivel * 5;
  personagem.xpAtual += xp;

  print(`XP ganho: ${xp}`, "dano");

  verificarLevelUp();

  const loot = gerarDrops(inimigoAtual);
  adicionarDropsAoInventario(loot);

  if (inimigoAtual.nome === chefes[gerenciadorCapitulo.nome].nome) {
    bossDerrotado = true;

    const index = capitulos.indexOf(gerenciadorCapitulo);

    if (index < capitulos.length - 1) {
      gerenciadorCapitulo = capitulos[index + 1];
      gerenciadorCapitulo.progressoatual = 0;

      bossDerrotado = false;
      inimigoAtual = null;
      emBatalha = false;

      print(`Novo capítulo: ${gerenciadorCapitulo.nome}`);
    } else {
      print("Você zerou o jogo!");
      jogoFinalizado = true;
    }
  }

  inimigoAtual = null;
  atualizarEnemyUI(null);
  atualizarBarras();
  atualizarHUD();
  setTimeout(() => {
    progressoCapitulo();
  }, 100);
}

function abrirLoja() {
  if (emBatalha) {
    print("Não pode acessar a loja em batalha!");
    return;
  }

  document.getElementById("loja").style.display = "block";

  renderizarLoja();
}
function renderizarLoja() {
  const loja = document.getElementById("loja");

  loja.innerHTML = `
    <div style="display:flex;height:100%;">

        <div style="
            width:220px;
            border-right:2px solid #333;
            padding-right:15px;
            text-align:center;
        ">

            <img
                src="img/mercador.png"
                style="
                    width:180px;
                    height:180px;
                    object-fit:cover;
                    border:2px solid white;
                "
            >

            <h2>Mercadora</h2>

            <p>Ouro: ${personagem.moeda}</p>

            <p>
                "Tenho os melhores preços da região."
            </p>

            <button onclick="fecharLoja()">
                Voltar
            </button>

        </div>

        <div style="
            flex:1;
            padding-left:20px;
            overflow-y:auto;
        ">

            <h2>Loja</h2>
            <hr>

            <div id="listaLoja"></div>

        </div>

    </div>
    `;

  const lista = document.getElementById("listaLoja");

  produtos.forEach((item, index) => {
    let info = "";

    if (item.tipo === "arma") info = `ATK +${item.forca}`;

    if (item.tipo === "armadura") info = `DEF +${item.defesa}`;

    if (item.tipo === "consumivel") info = `CURA ${item.cura}`;

    lista.innerHTML += `
            <div style="
                margin-bottom:10px;
                border-bottom:1px solid #333;
                padding-bottom:10px;
            ">
                <b>${item.nome}</b><br>
                ${info}<br>
                Preço: ${item.preco} Ouro<br>
                Estoque: ${item.quantidade}

                <br><br>

                <button onclick="comprarUI(${index})">
                    COMPRAR
                </button>
            </div>
        `;
  });
}
function comprarUI(index) {
  const item = produtos[index];

  if (!item) return;

  if (personagem.moeda < item.preco) {
    print("Ouro insuficiente!");
    return;
  }

  if (item.quantidade <= 0) {
    print("Esgotado!");
    return;
  }

  personagem.moeda -= item.preco;
  item.quantidade -= 1;

  personagem.inventário.push({ ...item });

  print(`Você comprou: ${item.nome}`);

  atualizarHUD();
  renderizarLoja();
}
function abrirInventario() {
  if (emBatalha) {
    print("Não pode abrir o inventário em batalha!");
    return;
  }

  document.getElementById("inventario").style.display = "block";

  renderizarInventario();
}
function renderizarInventario() {
  const inv = document.getElementById("inventario");

  inv.innerHTML = `
    <div style="display:flex;height:100%;">

        <div style="
            width:220px;
            border-right:2px solid #333;
            padding-right:15px;
            text-align:center;
        ">

            <img
                src="${personagem.img}"
                style="
                    width:180px;
                    height:180px;
                    object-fit:cover;
                    border:2px solid white;
                "
            >

            <h2>${personagem.nome}</h2>

            <p>Lv ${personagem.nivel}</p>

            <p>
                HP: ${personagem.vida}/${personagem.vidaMaxima}
            </p>

            <hr>

            <p>
                Arma:
                ${personagem.arma?.nome || "Nenhuma"}
            </p>

            <p>
                Armadura:
                ${personagem.armadura?.nome || "Nenhuma"}
            </p>

            <button onclick="fecharInventario()">
                Voltar
            </button>

        </div>

        <div style="
            flex:1;
            padding-left:20px;
            overflow-y:auto;
        ">

            <h2>Inventário</h2>
            <hr>

            <div id="listaItens"></div>

        </div>

    </div>
    `;

  const lista = document.getElementById("listaItens");

  personagem.inventário.forEach((item, index) => {
    let info = "";

    if (item.tipo === "arma") info = `ATK +${item.forca}`;

    if (item.tipo === "armadura") info = `DEF +${item.defesa}`;

    if (item.tipo === "consumivel") info = `CURA ${item.cura}`;

    lista.innerHTML += `
            <div style="
                margin-bottom:10px;
                border-bottom:1px solid #333;
                padding-bottom:10px;
            ">
                <b>${item.nome}</b><br>
                ${info}<br>

                <button onclick="usarItemUI(${index})">
                    USAR / EQUIPAR
                </button>
            </div>
        `;
  });
}
function fecharLoja() {
  document.getElementById("loja").style.display = "none";
}

function fecharInventario() {
  document.getElementById("inventario").style.display = "none";
}
function usarItemUI(index) {
  const item = personagem.inventário[index];

  if (!item) return;

  if (item.tipo === "arma") {
    equiparArmaUI(item, index);
  } else if (item.tipo === "armadura") {
    equiparArmaduraUI(item, index);
  } else if (item.tipo === "consumivel") {
    usarConsumivelUI(item, index);
  }

  atualizarHUD();
  renderizarInventario();
}
function equiparArmaUI(arma, index) {
  const armaAntiga = personagem.arma;

  personagem.arma = arma;

  personagem.inventário.splice(index, 1);

  if (armaAntiga) {
    personagem.inventário.push(armaAntiga);
  }

  print(`Equipou: ${arma.nome}`);
}
function equiparArmaduraUI(armadura, index) {
  const antiga = personagem.armadura;

  personagem.armadura = armadura;

  personagem.inventário.splice(index, 1);

  if (antiga) {
    personagem.inventário.push(antiga);
  }

  print(`Equipou: ${armadura.nome}`);
}
function usarConsumivelUI(item, index) {
  personagem.vida += item.cura;

  if (personagem.vida > personagem.vidaMaxima) {
    personagem.vida = personagem.vidaMaxima;
  }

  personagem.inventário.splice(index, 1);

  print(`Usou: ${item.nome} (+${item.cura} HP)`);

  atualizarBarras();
  atualizarHUD();
  renderizarInventario(); // atualiza a lista
}
function atualizarBarras() {
  atualizarPlayerUI();

  if (inimigoAtual) {
    atualizarEnemyUI(inimigoAtual);
  } else {
    atualizarEnemyUI(null);
  }
}

atualizarHUD();
atualizarPlayerUI();
atualizarBotoes();
print("Bem-vindo ao RPG!");
