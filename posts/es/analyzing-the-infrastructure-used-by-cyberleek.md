---
title: Analizando la infraestructura utilizada por Cyberleek
date: 2026-08-26
---

Como probablemente ya sepáis, en los últimos días Rockstar ha sufrido lo que podría considerarse uno de los ataques más significativos de su historia. Desde hace varios días, Cyberleek ha ido publicando distintas filtraciones de GTA VI, perdiendo unos 2.830 millones de dólares en bolsa y afectando a la campaña de marketing que la compañía tenía prevista para el lanzamiento del juego.

En este momento sabemos muy poco sobre la identidad real que se oculta tras el seudónimo de Cyberleek y sobre los métodos empleados para acceder al material filtrado. Es muy probable que estos detalles salgan a la luz en las próximas semanas o meses. Por ese motivo, este artículo no se centrará en el ataque en sí ni en el contenido de las filtraciones, sino en la infraestructura que Cyberleek está utilizando para obtener un beneficio económico de ellas y en las medidas que está adoptando para evitar ser identificado por las autoridades.

![cyberleek-and-cops](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-cops.webp)

## $CYBERLEEK token

En las distintas filtraciones que el actor Cyberleek ha publicado, se daba a entender que la finalidad de este ataque se basaba en un activismo en favor de los consumidores, derivado de la polémica que ha suscitado el hecho de que GTA VI no será publicado en formato físico. En este punto, ya todos sabemos que esto no era más que un intento de conseguir la aceptación del público y que la verdadera finalidad es sacar un rédito económico.

En todos los vídeos filtrados hemos podido ver un CTA que nos invita a tradear con el token $CYBERLEEK creado en la blockchain de Solana.

Analizando los fondos de las distintas direcciones de Solana que han sido utilizadas para desplegar la infraestructura de Cyberleek, como la creación del token y el despliegue de la web en Arweave (el cual veremos más en detalle en la siguiente sección del artículo), todos provienen de una misma wallet perteneciente al exchange KuCoin. En principio este exchange requiere KYC, aunque creo que permite cierta actividad sin él. Con una citación judicial KuCoin estaría obligado a entregar los datos del dueño de la wallet, pero teniendo en cuenta las magnitudes del ataque, esta cuenta seguramente ha sido creada mediante suplantación de identidad.

Si miramos en un [análisis](https://gtaforums.com/topic/994376-spoilers-gta-vi-leaks-analysis-thread-part-ii/page/314/#comment-1072766077) publicado por el usuario Vice Cit en GTAForums, estas serían las transacciones rastreadas:

![cyberleek-wallets](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-wallets.webp)

<small>KuCoin Wallet > FWbi > J4zo > 26sZ > EjsB > 2zDu > wallet fundadora de todo</small>

Cyberleek gana dinero principalmente a través de las comisiones de trading del token $CYBERLEEK en Raydium. Al crear el token, depositó la mayor parte de la liquidez (730 millones de tokens + 330 SOL) en un pool y la bloqueó de forma permanente con el sistema Burn & Earn. Esto le impide retirar el dinero de la liquidez (evitando un rug pull), pero le permite cobrar de manera continua aproximadamente el 0,21 % de todo el volumen de compras y ventas que se realicen en ese pool, gracias al Fee Key NFT que controla casi el 98 % de esa liquidez bloqueada.

Cuanto más volumen genera el hype de las filtraciones de GTA VI, más comisiones recibe. Por eso gotea el contenido poco a poco y usa votaciones con el propio token: mantiene el interés y el trading activo el mayor tiempo posible. Aunque en un momento retuvo 270 millones de tokens (que luego quemó), la fuente de ingresos real y sostenida son estas fees diarias, que en los primeros días ya le permitieron recuperar la inversión inicial de unos 29.000 dólares y seguir generando miles de dólares mientras el volumen ha ido aumentando.

Aparte del token emitido, Cyberleek ofrece un servicio publicitario para las futuras filtraciones que vaya publicando de GTA VI. Se trata de una jugada con bastantes más riesgos que el lanzamiento de un token, ya que le obliga a abrir un canal de comunicación directo de negociación, siendo en estos momentos una de las personas más perseguidas.

## Sitio web de Cyberleek

Como hemos comentado, el principal medio de exposición de Cyberleek es su página web. Para no ser identificado tan fácilmente, en lugar de usar las típicas soluciones de hosting y DNS, el sitio está construido sobre el Permaweb, utilizando Arweave como sistema de almacenamiento permanente y ArNS (Arweave Name System) como sistema de nombres.

El contenido —HTML, JavaScript, vídeos, imágenes...— se sube a la blockchain de Arweave, donde queda almacenado de forma prácticamente inmutable. En lugar de una URL larga e ilegible, se utilizan nombres legibles como `cyberleek.ar.io` o `leek.ar.io`, que apuntan a ese contenido. Estos nombres se registraron el 14 de agosto de 2026, un día antes del lanzamiento del token y varios días antes de que las filtraciones se hicieran públicas.

El funcionamiento se basa en una red de gateways independientes de ar.io. Cuando un usuario accede a uno de estos nombres, el gateway resuelve a qué contenido de Arweave apunta y lo sirve. Como existen cientos de gateways operados por distintos actores, si uno bloquea o deja de funcionar, otros pueden seguir sirviendo la misma web. Esto convierte el sitio en una infraestructura mucho más resistente a la censura que un dominio convencional. Además, se crearon variantes tipográficas de respaldo (`cyberleak.ar.io` y `ciberleek.ar.io`) que apuntan al mismo contenido, aumentando la disponibilidad del servicio.

En los últimos días la web ha sufrido intentos de bloqueo. Algunos gateways han empezado a devolver códigos de error 451 (bloqueado por política de contenido) o a dejar de responder, y Take-Two ha intensificado las acciones legales y los DMCAs. Sin embargo, gracias a la arquitectura distribuida, el contenido base sigue accesible a través de otros gateways y mirrors. El material almacenado en Arweave no puede eliminarse fácilmente, por lo que, aunque se cierren puntos de acceso concretos, la información permanece disponible en la red.

Las funcionalidades que ofrece la web son varias. Incluye el manifiesto completo (conocido como “The CYBERLEEK Edict”), donde se detallan las tres demandas sobre preventas digitales, DLC y preservación de juegos. Dispone de una sección de “Leeks” con todos los vídeos e imágenes filtrados, enlazados tanto a Arweave como a mirrors externos. Muestra en tiempo real la información del token $CYBERLEEK (precio, market cap, liquidez y estado de seguridad). Incorpora un sistema de votaciones on-chain: cada opción de la encuesta tiene una wallet de Solana asociada y los usuarios votan enviando tokens $CYBERLEEK a esa dirección, la web lee los balances y calcula los porcentajes automáticamente.

![cyberleek-website](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-website.webp)

## 3x1 con Monero

Es en este último servicio de publicidad donde vamos a profundizar un poco más. Cyberleek exige un mínimo de 400 XMR para poder hablar con él y negociar el servicio publicitario que ofrece. Al cambio de finales de agosto de 2026, esos 400 XMR equivalían aproximadamente a 165.000 – 169.000 dólares. Esta cantidad no compra el anuncio en sí, sino que funciona como una tarifa de contacto: garantiza que Cyberleek responderá en un plazo máximo de 24 horas a través de Session para empezar a negociar. De esta forma filtra el spam y los contactos no serios, al tiempo que genera un ingreso adicional potencialmente muy elevado.

Para este uso, Monero encaja especialmente bien por cómo está diseñado a nivel de protocolo. En Monero, la privacidad no es una opción que el usuario activa: va integrada en cada transacción. El remitente se oculta mediante firmas en anillo (ring signatures): cada entrada se mezcla con varias salidas antiguas de la blockchain que actúan como señuelos, de forma que un observador externo no puede determinar con certeza cuál de ellas es la real. El destinatario se protege con direcciones sigilosas (stealth addresses): por cada pago se genera una dirección única de un solo uso, derivada criptográficamente de la dirección pública del receptor, de modo que no queda un vínculo visible entre distintos cobros recibidos por la misma persona. Además, las cantidades van cifradas con RingCT (Ring Confidential Transactions), así que ni el importe transferido es legible en claro en la cadena. El resultado es que, mirando la blockchain, resulta muy difícil saber quién envió, quién recibió y cuánto se movió. Para alguien que necesita recibir fondos sin dejar un rastro on-chain tan explícito, esa combinación de ocultación de origen, destino e importe supone una ventaja operativa importante.

![monero-meme](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/monero-meme.webp)

Hoy en día, con el nivel de vigilancia que existe en internet, parece  casi imposible comunicarse de forma realmente privada. Probablemente no  exista ninguna solución que cumpla al 100 % con un requisito tan inmoral, pero la opción utilizada por Cyberleek es una de las mejores  aplicaciones de mensajería orientadas a la privacidad disponibles  actualmente.

## Session

Personalmente no conocía Session, por lo que me leí el [whitepaper](https://arxiv.org/pdf/2002.04609). Después de leerlo, considero que es una de las mejores soluciones actuales para mantener conversaciones privadas, y te recomiendo que lo leas también.

Session es una aplicación de mensajería de código abierto diseñada para reducir al mínimo la filtración de metadatos. Aunque nació como un fork de Signal y conserva el cifrado de extremo a extremo, su arquitectura se aleja radicalmente del modelo centralizado. En lugar de depender de servidores controlados por una empresa (como ocurre en Signal, WhatsApp o Telegram), se apoya en tres pilares: una red de nodos incentivados económicamente, un sistema de enrutamiento cebolla similar a Tor y un almacenamiento distribuido en pequeños grupos llamados swarms.

La red está formada por Session Nodes que cualquiera puede operar, aunque para hacerlo es obligatorio depositar (hacer stake) una cantidad de tokens. Este requisito económico es la principal diferencia respecto a redes como Tor. En Tor los nodos son voluntarios y altruistas, por lo que un adversario con suficientes nodos puede intentar controlar un porcentaje elevado de la red (ataque Sybil o de mayoría) sin un coste proporcional. En Session, para controlar una parte significativa de la red hay que comprar y bloquear una gran cantidad de tokens. Cuantos más tokens se adquieren y se apuestan, más se reduce la oferta circulante y más sube el precio, encareciendo progresivamente el ataque. Además, un nodo que se comporte de forma maliciosa puede perder el depósito. De esta forma se introduce un coste real y creciente a cualquier intento de tomar el control de la red.

Para ocultar las direcciones IP, Session utiliza onion requests (solicitudes cebolla). Cada mensaje se cifra en varias capas sucesivas y atraviesa una ruta de tres nodos elegidos aleatoriamente. El emisor cifra el mensaje primero con la clave del último nodo, después con la del nodo intermedio y finalmente con la del primero. Cada nodo, al recibir el mensaje, solo puede descifrar su propia capa. De esta forma, el primer nodo ve la IP del cliente y sabe a qué nodo intermedio debe enviarlo, pero no conoce el destino final. El nodo intermedio solo ve de qué nodo viene y a cuál debe reenviarlo. El último nodo es el único que puede descifrar la capa final y entregar el mensaje al destinatario. Ninguno de los tres nodos dispone de la información completa sobre el origen y el destino de la comunicación.

![session-onion](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/session-onion.webp)

Los mensajes no se guardan en un servidor central ni en la blockchain. Se almacenan de forma temporal y distribuida en swarms (grupos pequeños de entre 5 y 10 nodos). Cada usuario se asigna de forma automática y determinista a un swarm a partir de su identificador. Cuando alguien envía un mensaje, este llega a uno de los nodos del swarm del destinatario y se replica al resto. Si uno de los nodos se cae, los demás siguen teniendo copia. Los mensajes tienen un tiempo de caducidad y se eliminan automáticamente cuando expira.

Las cuentas en Session son extremadamente simples: consisten únicamente en un par de claves criptográficas (pública y privada) generado localmente en el dispositivo. La clave pública se convierte en el Account ID, un identificador seudónimo de 66 caracteres que no está vinculado a ningún número de teléfono, correo electrónico ni dato personal. La clave privada permite firmar y descifrar los mensajes, y se representa como una frase de recuperación que el usuario debe guardar de forma segura.

### Cómo combina Cyberleek Monero y Session

Cyberleek aprovecha la simplicidad de las cuentas de Session y la privacidad de Monero para montar un sistema de contacto bastante inteligente. En la web no muestra en ningún momento su Account ID de Session. Si lo hiciera, cualquiera podría intentar escribirle y, además, ese identificador quedaría expuesto públicamente. En su lugar, utiliza un mecanismo que vincula el pago en Monero con una cuenta de Session de forma indirecta.

Cuando alguien solicita contactar, el sistema genera dos cosas:

- Una frase de recuperación de Session de una cuenta completamente nueva, (la cual permite restaurar la clave privada de la cuenta) 
- Una cantidad exacta de Monero que empieza por 400 y añade una serie de decimales únicos (por ejemplo, 400.123456789012).

Esos decimales funcionan como un identificador. El interesado debe enviar exactamente esa cantidad desde un monedero personal de Monero. Si lo hace desde un exchange, es muy probable que la cantidad se redondee o que se descuenten comisiones, con lo que se pierde el identificador y Cyberleek no puede vincular el pago a esa cuenta concreta.

Cyberleek, al recibir la transacción en su monedero de Monero (donde solo él puede ver con claridad los detalles gracias a las propiedades de privacidad de Monero), utiliza esos decimales para identificar y derivar la cuenta de Session correspondiente. Una vez hecho esto, inicia la conversación a través de Session en un plazo máximo de 24 horas.

De esta forma consigue tres objetivos a la vez: filtra a quien no está dispuesto a pagar una cantidad elevada, obtiene un ingreso significativo y mantiene un canal de comunicación con un nivel de privacidad considerablemente más alto que el que tendría usando cualquier mensajería convencional o dejando expuesto un identificador de forma pública.

## Conclusión

Cyberleek ha montado una infraestructura bastante sofisticada: un token en Solana para generar ingresos continuos a través de las fees, una web resistente a la censura sobre Arweave y ArNS, y un sistema de contacto que combina la privacidad de Monero con Session. Todo ello pensado para maximizar el beneficio económico mientras dificulta su identificación.

Más allá del caso concreto y de las intenciones de quien lo ha utilizado, la arquitectura en sí misma deja varias lecciones interesantes. El uso de almacenamiento permanente y nombres descentralizados, el diseño de redes de mensajería que minimizan los metadatos, o la separación clara entre identidad y comunicación son herramientas que, aplicadas de forma ética, pueden servir para proteger la privacidad de periodistas, activistas o cualquier persona que necesite comunicarse o publicar información sin exponerse innecesariamente.
