---
title: Analyzing the infrastructure used by Cyberleek
date: 2026-08-26
---

As you have probably already heard, Rockstar has spent the last few days dealing with what may be one of the most significant attacks in its history. For several days now, Cyberleek has been publishing successive GTA VI leaks, wiping about $2.83 billion off the company's market value and disrupting the marketing campaign planned for the game's launch.

At this point we still know very little about the real identity behind the Cyberleek alias, or about the methods used to obtain the leaked material. Those details will likely come out in the coming weeks or months. For that reason, this article will not focus on the attack itself or on the contents of the leaks. It will look at the infrastructure Cyberleek is using to extract economic value from them, and at the steps being taken to avoid being identified by the authorities.

![cyberleek-and-cops](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-cops.webp)

## $CYBERLEEK token

In the various leaks Cyberleek has published, the attack was framed as consumer activism, tied to the controversy over GTA VI not being released on physical media. By now it is clear that this was only an attempt to win public sympathy, and that the real goal is to make money.

Every leaked video includes a CTA inviting viewers to trade the $CYBERLEEK token created on Solana.

If you trace the funds behind the Solana addresses used to stand up Cyberleek's infrastructure — token creation and the site deployment on Arweave, which we will look at in more detail below — they all flow from the same wallet belonging to the KuCoin exchange. In principle that exchange requires KYC, although I believe it still allows some activity without it. With a court order, KuCoin would have to hand over the wallet owner's data. Given the scale of the attack, that account was almost certainly opened with stolen or fake identity documents.

Looking at an [analysis](https://gtaforums.com/topic/994376-spoilers-gta-vi-leaks-analysis-thread-part-ii/page/314/#comment-1072766077) posted by user Vice Cit on GTAForums, these are the traced transactions:

![cyberleek-wallets](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-wallets.webp)

<small>KuCoin Wallet > FWbi > J4zo > 26sZ > EjsB > 2zDu > the founding wallet behind everything</small>

Cyberleek's main income comes from trading fees on the $CYBERLEEK token on Raydium. When the token was created, most of the liquidity (730 million tokens + 330 SOL) was deposited into a pool and locked permanently with Burn & Earn. That makes it impossible to pull the money out of the pool (so there is no classic rug pull), but it allows a continuous cut of roughly 0.21% of all buys and sells in that pool, through the Fee Key NFT that controls almost 98% of the locked liquidity.

The more volume the GTA VI leak hype generates, the more fees come in. That is why the content is dripped out slowly and why votes are run with the token itself: it keeps attention high and trading alive for as long as possible. At one point 270 million tokens were held back (and later burned), but the real, ongoing source of income is these daily fees. In the first few days they were already enough to recoup the initial outlay of about $29,000, and they have kept producing thousands of dollars as volume has grown.

Besides the token, Cyberleek also sells advertising against future GTA VI leaks. That move is considerably riskier than launching a token, because it forces a direct negotiation channel with one of the most wanted people on the internet right now.

## The Cyberleek website

As noted above, Cyberleek's main public surface is the website. To make identification harder, instead of ordinary hosting and DNS the site is built on the Permaweb, using Arweave for permanent storage and ArNS (Arweave Name System) for naming.

The content — HTML, JavaScript, videos, images, and so on — is uploaded to the Arweave chain, where it is stored in a form that is effectively immutable. Instead of a long, unreadable URL, human-readable names such as `cyberleek.ar.io` or `leek.ar.io` point at that content. Those names were registered on 14 August 2026, one day before the token launch and several days before the leaks went public.

Resolution runs through an independent network of ar.io gateways. When a user opens one of these names, the gateway looks up which Arweave content it points to and serves it. There are hundreds of gateways run by different operators, so if one blocks the site or goes down, others can keep serving the same pages. That makes the site much harder to take down than a conventional domain. Backup typographic variants (`cyberleak.ar.io` and `ciberleek.ar.io`) were also created and pointed at the same content, which further improves availability.

In the last few days the site has come under blocking attempts. Some gateways have started returning 451 status codes (blocked by content policy) or have stopped responding, and Take-Two has stepped up legal action and DMCA notices. Because of the distributed design, though, the underlying content remains reachable through other gateways and mirrors. Material stored on Arweave cannot be deleted easily, so even if specific access points are shut down, the information stays on the network.

The site itself has several functions. It hosts the full manifesto (known as “The CYBERLEEK Edict”), which sets out the three demands on digital pre-orders, DLC and game preservation. There is a “Leeks” section with every leaked video and image, linked both to Arweave and to external mirrors. It shows live data for the $CYBERLEEK token (price, market cap, liquidity and security status). It also includes an on-chain voting system: each poll option has an associated Solana wallet, users vote by sending $CYBERLEEK tokens to that address, and the site reads the balances and computes the percentages automatically.

![cyberleek-website](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/cyberleek-website.webp)

## Three for one with Monero

This last service — the advertising channel — is the one worth digging into. Cyberleek requires a minimum of 400 XMR just to start a conversation and negotiate the ad offering. At late-August 2026 rates, 400 XMR was worth roughly $165,000–$169,000. That amount does not buy the ad itself. It is a contact fee: it guarantees that Cyberleek will reply within 24 hours over Session and begin negotiations. It filters out spam and unserious inquiries, while also creating a potentially very large extra income stream.

Monero is a particularly good fit here because of how the protocol is designed. In Monero, privacy is not a setting the user turns on; it is built into every transaction. The sender is hidden with ring signatures: each input is mixed with several older outputs on the chain that act as decoys, so an outside observer cannot tell with certainty which one is real. The recipient is protected with stealth addresses: every payment generates a unique one-time address, derived cryptographically from the receiver's public address, so there is no visible link between different payments to the same person. Amounts are encrypted with RingCT (Ring Confidential Transactions), so the value transferred is not readable in the clear on-chain either. The result is that, looking at the blockchain, it is very hard to tell who sent, who received, and how much moved. For someone who needs to take funds without leaving an obvious on-chain trail, hiding origin, destination and amount at the same time is a real operational advantage.

![monero-meme](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/monero-meme.webp)

These days, with the level of surveillance on the internet, truly private communication looks almost impossible. There is probably no tool that fully satisfies a requirement this far outside the law, but the option Cyberleek is using is one of the stronger privacy-oriented messengers available right now.

## Session

I had not used Session myself, so I read the [whitepaper](https://arxiv.org/pdf/2002.04609). After going through it, I think it is one of the better current options for keeping conversations private, and I would recommend reading it as well.

Session is an open-source messenger designed to leak as little metadata as possible. It started as a Signal fork and still uses end-to-end encryption, but the architecture is a long way from the centralized model. Instead of servers controlled by a company (as with Signal, WhatsApp or Telegram), it rests on three pillars: a network of economically incentivized nodes, onion routing similar to Tor, and distributed storage in small groups called swarms.

The network is made up of Session Nodes that anyone can run, although doing so requires staking a quantity of tokens. That economic requirement is the main difference from networks like Tor. On Tor, nodes are voluntary and altruistic, so an adversary with enough machines can try to control a large share of the network (a Sybil or majority attack) without a matching financial cost. On Session, controlling a meaningful part of the network means buying and locking a large amount of tokens. The more tokens are bought and staked, the smaller the circulating supply becomes and the higher the price goes, which steadily makes the attack more expensive. A node that misbehaves can also lose its stake. That introduces a real, and rising, cost to any attempt to take over the network.

To hide IP addresses, Session uses onion requests. Each message is encrypted in successive layers and travels a path of three randomly chosen nodes. The sender encrypts first with the last node's key, then with the middle node's, then with the first node's. Each hop can unwrap only its own layer. The first node sees the client's IP and knows which middle node to forward to, but not the final destination. The middle node only sees which node the message came from and which node it should go to next. The last node is the only one that can unwrap the final layer and deliver the message. None of the three nodes has the full picture of both origin and destination.

![session-onion](/img/posts/analyzing-the-infrastructure-used-by-cyberleek/session-onion.webp)

Messages are not stored on a central server or on a blockchain. They are held temporarily and in a distributed way in swarms (small groups of 5 to 10 nodes). Each user is assigned automatically and deterministically to a swarm from their identifier. When someone sends a message, it reaches one of the recipient's swarm nodes and is replicated to the rest. If one node drops offline, the others still have a copy. Messages have an expiry time and are deleted automatically when it lapses.

Accounts in Session are extremely simple: just a locally generated public/private key pair. The public key becomes the Account ID, a 66-character pseudonymous identifier that is not tied to a phone number, email address or any other personal data. The private key is used to sign and decrypt messages, and is represented as a recovery phrase that the user has to store safely.

### How Cyberleek combines Monero and Session

Cyberleek uses the simplicity of Session accounts and the privacy of Monero to build a fairly clever contact system. The site never shows a Session Account ID. If it did, anyone could try to message him, and that identifier would be sitting in public. Instead, the mechanism ties a Monero payment to a Session account indirectly.

When someone asks to make contact, the system generates two things:

- A Session recovery phrase for a brand-new account (which can restore the account's private key)
- An exact Monero amount that starts with 400 and adds a unique string of decimals (for example, 400.123456789012).

Those decimals work as an identifier. The interested party has to send exactly that amount from a personal Monero wallet. If the payment comes from an exchange, the amount will likely be rounded or have fees deducted, the identifier is lost, and Cyberleek cannot bind the payment to that specific account.

When the transaction arrives in Cyberleek's Monero wallet (where only he can see the details clearly, thanks to Monero's privacy properties), those decimals are used to identify and derive the matching Session account. After that, the conversation is started over Session within 24 hours.

That achieves three things at once: it filters out anyone unwilling to pay a large amount, it produces a significant extra payment, and it keeps a communications channel with considerably stronger privacy than conventional messaging — or than publishing an identifier in the open.

## Conclusion

Cyberleek has put together a fairly sophisticated stack: a Solana token that produces a continuous income from fees, a censorship-resistant site on Arweave and ArNS, and a contact system that pairs Monero's privacy with Session. All of it is designed to maximize economic return while making identification harder.

Beyond this specific case and the intentions of the person using it, the architecture itself leaves a few interesting lessons. Permanent storage and decentralized names, messaging networks that minimize metadata, and a clean split between identity and communication are tools that, used ethically, can help protect the privacy of journalists, activists, or anyone who needs to publish or talk without exposing themselves more than necessary.
