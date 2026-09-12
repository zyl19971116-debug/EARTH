"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Menu,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { toast, Toaster } from "sonner";
import { usePathname, useRouter } from "next/navigation";

function Link({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

type Token = {
  name: string;
  ticker: string;
  category: string;
  cap: string;
  change: string;
  color: string;
  data: number[];
  address: string;
};
const tokens: Token[] = [
  [
    "Hyperliquid Points",
    "HYPE",
    "Perps & Trading",
    "$12.4M",
    "+128.5%",
    "#25D695",
    [12, 20, 17, 28, 25, 42, 55],
    "0xhype",
  ],
  [
    "Polymarket Rewards",
    "POLY",
    "Prediction Markets",
    "$8.92M",
    "+86.2%",
    "#3259F5",
    [12, 15, 23, 19, 30, 39, 44],
    "0xpoly",
  ],
  [
    "Monad XP",
    "MON",
    "Layer 1",
    "$6.41M",
    "+42.1%",
    "#836EF9",
    [8, 18, 15, 22, 31, 29, 38],
    "0xmon",
  ],
  [
    "Base Builder Score",
    "BASE",
    "Onchain Social",
    "$5.22M",
    "+38.7%",
    "#0052FF",
    [15, 13, 20, 26, 23, 31, 37],
    "0xbase",
  ],
  [
    "Farcaster Warps",
    "WARP",
    "SocialFi",
    "$4.18M",
    "+32.6%",
    "#855DCD",
    [10, 16, 15, 23, 21, 29, 34],
    "0xwarp",
  ],
  [
    "EigenLayer Points",
    "EIGEN",
    "Restaking",
    "$3.97M",
    "+28.4%",
    "#1A0C3D",
    [13, 15, 14, 22, 25, 26, 31],
    "0xeigen",
  ],
  [
    "Ethena Shards",
    "SHARD",
    "DeFi Yield",
    "$3.12M",
    "+25.1%",
    "#111111",
    [8, 11, 17, 15, 20, 24, 28],
    "0xshard",
  ],
  [
    "Berachain BGT Points",
    "BGT",
    "Proof of Liquidity",
    "$2.84M",
    "+21.3%",
    "#F5A623",
    [7, 12, 10, 16, 19, 23, 25],
    "0xbgt",
  ],
].map(
  (x) =>
    ({
      name: x[0],
      ticker: x[1],
      category: x[2],
      cap: x[3],
      change: x[4],
      color: x[5],
      data: x[6],
      address: x[7],
    }) as Token,
);
const milestones = [
  {
    name: "Hyperliquid $1T Volume",
    ticker: "HL1T",
    cap: "$18.2M",
    change: "+156%",
    progress: 78,
  },
  {
    name: "Polymarket 10M Traders",
    ticker: "POLY10M",
    cap: "$9.61M",
    change: "+112%",
    progress: 86,
  },
  {
    name: "Monad 1M Wallets",
    ticker: "MON1M",
    cap: "$7.44M",
    change: "+86%",
    progress: 64,
  },
  {
    name: "Base 100M Transactions",
    ticker: "BASE100",
    cap: "$6.21M",
    change: "+73%",
    progress: 91,
  },
  {
    name: "Farcaster 5M Users",
    ticker: "FC5M",
    cap: "$4.18M",
    change: "+62%",
    progress: 72,
  },
];
function Logo() {
  return (
    <Link href="/" className="logo">
      <i>P</i>
      <b>
        POINTS<span>//</span>FUN
      </b>
    </Link>
  );
}
const walletLogos: Record<string, string> = {
  MetaMask:
    "https://images.ctfassets.net/clixtyxoaeas/1ezuBGezqfIeifWdVtwU4c/d970d4cdf13b163efddddd5709164d2e/MetaMask-icon-Fox.svg",
  Rabby: "https://raw.githubusercontent.com/RabbyHub/logo/master/avatar.svg",
  "Coinbase Wallet":
    "https://avatars.githubusercontent.com/u/1885080?s=200&v=4",
  Phantom:
    "https://mintcdn.com/phantom-e50e2e68/tU9g5MXFXgx4l6Em/resources/images/Phantom_SVG_Icon.svg",
};
function WalletLogo({ name }: { name: string }) {
  return (
    <img
      className="walletlogo"
      src={walletLogos[name]}
      alt={`${name} official logo`}
    />
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState(false),
    [menu, setMenu] = useState(false);
  const path = usePathname(),
    router = useRouter();
  return (
    <>
      <header>
        <Logo />
        <nav className={menu ? "open" : ""}>
          {[
            "Home",
            "Launch",
            "Points",
            "Milestones",
            "Leaderboard",
            "Explore",
          ].map((x) => {
            const href = x === "Home" ? "/" : `/${x.toLowerCase()}`;
            return (
              <Link
                className={path === href ? "current" : ""}
                key={x}
                href={href}
                onClick={() => setMenu(false)}
              >
                {x}
              </Link>
            );
          })}
        </nav>
        <div className="actions">
          <div className="search">
            <Search size={16} />
            <input
              aria-label="Search markets"
              placeholder="Search Web3 points and protocols..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim())
                  router.push(
                    `/explore?q=${encodeURIComponent(e.currentTarget.value.trim())}`,
                  );
              }}
            />
          </div>
          <button className="dark" onClick={() => setWallet(true)}>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
          <button
            className="menu"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {children}
      <Footer />
      <Toaster richColors position="top-center" />
      {wallet && (
        <div className="modal" onClick={() => setWallet(false)}>
          <div
            className="modalbox"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="between">
              <h3>Connect a wallet</h3>
              <button
                aria-label="Close wallet dialog"
                onClick={() => setWallet(false)}
              >
                <X />
              </button>
            </div>
            <p>Choose a leading wallet to enter POINTS//FUN.</p>
            {["MetaMask", "Rabby", "Coinbase Wallet", "Phantom"].map((w) => (
              <button
                className="walletrow"
                key={w}
                onClick={() => {
                  setWallet(false);
                  toast.success(`${w} connected (demo)`);
                }}
              >
                <WalletLogo name={w} />
                <span>{w}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function Spark({ t }: { t: Token }) {
  return (
    <div className="spark">
      <ResponsiveContainer>
        <AreaChart data={t.data.map((v) => ({ v }))}>
          <Area
            dataKey="v"
            type="monotone"
            stroke={t.color}
            strokeWidth={2.2}
            fill={t.color}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function Card({ t }: { t: Token }) {
  const [f, setF] = useState(false);
  return (
    <Link href={`/token/${t.address}`} className="card">
      <div className="between">
        <i className="coin" style={{ background: t.color }}>
          {t.ticker[0]}
        </i>
        <button
          onClick={(e) => {
            e.preventDefault();
            setF(!f);
          }}
        >
          <Heart
            size={17}
            fill={f ? "#ff6b82" : "none"}
            color={f ? "#ff6b82" : "#98a2b3"}
          />
        </button>
      </div>
      <h3>{t.name}</h3>
      <p className="ticker">
        ${t.ticker} · {t.category}
      </p>
      <Spark t={t} />
      <div className="between">
        <div>
          <small>MARKET CAP</small>
          <b>{t.cap}</b>
        </div>
        <strong>{t.change}</strong>
      </div>
    </Link>
  );
}
function HeroArt() {
  return (
    <div className="art">
      <div className="bubble" />
      <div className="float f1">
        <small>PERPS POINTS</small>
        <b>Hyperliquid → $HYPE</b>
      </div>
      <div className="float f2">
        <small>ONCHAIN REWARDS</small>
        <b>Monad XP → $MON</b>
      </div>
      <div className="bigcoin">
        <i>P</i>
        <small>POINTS</small>
        <b>
          10,000 <em>↑</em>
        </b>
      </div>
      <div className="float mile">
        <div className="between">
          <small>MILESTONE</small>
          <b>78%</b>
        </div>
          <strong>Polymarket 10M Traders</strong>
        <div className="progress">
          <i style={{ width: "78%" }} />
        </div>
        <p>Big moments deserve a coin.</p>
      </div>
    </div>
  );
}
function Home() {
  const [cat, setCat] = useState("Trending");
  const shown =
    cat === "Trending" || cat === "All"
      ? tokens
      : tokens.filter((t) => t.category === cat);
  return (
    <Shell>
      <main>
        <section className="hero">
          <div>
            <label>
              <Sparkles size={14} /> POINTS EVERYTHING ONCHAIN
            </label>
            <h1>
              Every Point
              <br />
              Can Be a <span>Coin.</span>
            </h1>
            <h2>Turn any point system and milestone into a community token.</h2>
            <p>
              From game points to app rewards, from user growth to historic
              moments — create, trade and be part of the next big thing.
            </p>
            <div className="buttons">
              <Link className="dark" href="/launch">
                Launch a Token <ArrowRight size={17} />
              </Link>
              <Link className="light" href="/explore">
                Explore Markets
              </Link>
            </div>
          </div>
          <HeroArt />
        </section>
        <section className="features">
          {[
            [Rocket, "Fast Launch", "Deploy in seconds"],
            [ShieldCheck, "Fair & Transparent", "On Robinhood Chain"],
            [Users, "Community Driven", "Built by everyone"],
          ].map(([Icon, a, b]) => (
            <div key={String(a)}>
              <i>{typeof Icon !== "string" && <Icon size={19} />}</i>
              <p>
                <b>{a as string}</b>
                <small>{b as string}</small>
              </p>
            </div>
          ))}
        </section>
        <section className="market">
          <div className="tabs">
            {[
              "Trending",
              "Perps & Trading",
              "Layer 1",
              "Restaking",
              "SocialFi",
              "Milestones",
              "All",
            ].map((x) => (
              <button
                className={cat === x ? "active" : ""}
                onClick={() => setCat(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="sectionhead">
            <div>
              <label>LIVE MARKETS</label>
              <h2>Trending Tokens</h2>
              <p>
                The point and milestone tokens everyone is watching right now.
              </p>
            </div>
            <Link href="/explore">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="markets">
            <div className="grid">
              {shown.map((t) => (
                <Card key={t.ticker} t={t} />
              ))}
            </div>
            <aside>
              <div className="asidehead">
                <span>
                  <TrendingUp />
                </span>
                <div>
                  <small>MILESTONES</small>
                  <h3>Top milestones</h3>
                </div>
              </div>
              {milestones.map((m, i) => (
                <Link
                  href={`/token/0x${m.ticker}`}
                  className="milerow"
                  key={m.ticker}
                >
                  <i>{String(i + 1).padStart(2, "0")}</i>
                  <div>
                    <b>{m.name}</b>
                    <small>
                      ${m.ticker} · {m.cap}
                    </small>
                    <div className="progress">
                      <i style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                  <strong>{m.change}</strong>
                </Link>
              ))}
            </aside>
          </div>
        </section>
        <section className="manifesto">
          <label>Turn Points Into Possibilities.</label>
          <h2>
            Small points.
            <br />
            <span>Big futures.</span>
          </h2>
          <p>
            Launch a fair, transparent market around the value your community
            already creates.
          </p>
        </section>
        <section className="cta">
          <div>
            <label>CREATE A MILESTONE</label>
            <h2>
              What’s Your Next
              <br />
              Milestone?
            </h2>
            <p>
              Create a token for your goal, track the progress, and let the
              community join the journey.
            </p>
            <Link className="dark" href="/launch?type=milestone">
              Launch a Milestone <ArrowRight />
            </Link>
          </div>
          <div className="ctaart">
            <i>P</i>
            <span>
              IDEA
              <br />
              COMMUNITY
              <br />
              MILESTONE
              <br />
              TO THE MOON ↗
            </span>
          </div>
        </section>
      </main>
    </Shell>
  );
}
function Launch() {
  const [type, setType] = useState("point"),
    [done, setDone] = useState(false);
  if (done)
    return (
      <Shell>
        <main className="page">
          <div className="success">
            <i>
              <Check />
            </i>
            <label>LAUNCH COMPLETE</label>
            <h1>Token Launched 🎉</h1>
            <p>Your community token is live on the bonding curve.</p>
            <div className="address">
              <code>0x7F28...9A41</code>
              <button onClick={() => toast.success("Address copied")}>
                <Copy />
              </button>
            </div>
            <div className="buttons">
              <Link className="dark" href="/token/0xgxp">
                View Token
              </Link>
              <button className="light">Share on X</button>
            </div>
          </div>
        </main>
      </Shell>
    );
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="CREATE ONCHAIN"
          title="Launch Your Token"
          text="Turn a point system or milestone into a community-owned market."
        />
        <div className="types">
          <button
            className={type === "point" ? "active" : ""}
            onClick={() => setType("point")}
          >
            <i>P</i>
            <b>
              POINT <small>Tokenize a point system</small>
            </b>
          </button>
          <button
            className={type === "milestone" ? "active" : ""}
            onClick={() => setType("milestone")}
          >
            <i>
              <TrendingUp />
            </i>
            <b>
              MILESTONE <small>Turn a goal into momentum</small>
            </b>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <div className="formhead">
            <div>
              <label>{type.toUpperCase()} LAUNCH</label>
              <h2>
                {type === "point"
                  ? "Create a Point Token"
                  : "Create a Milestone"}
              </h2>
            </div>
            <span>01 — DETAILS</span>
          </div>
          <div className="formgrid">
            <Field
              name={type === "point" ? "Point Name" : "Milestone Name"}
              placeholder={type === "point" ? "Hyperliquid Points" : "10M Onchain Traders"}
            />
            <Field
              name="Ticker"
              placeholder={type === "point" ? "HYPE" : "10M"}
            />
            <label className="full">
              Description
              <textarea
                required
                placeholder="Tell the community what this represents..."
              />
            </label>
            <label>
              {type === "point" ? "Category" : "Milestone Type"}
              <select>
                {[
                  "Perps & Trading",
                  "Layer 1",
                  "Restaking",
                  "Prediction Markets",
                  "SocialFi",
                  "DeFi Yield",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <Field
              name="Current Value"
              placeholder={type === "point" ? "10,000" : "780000"}
            />
            {type === "milestone" && (
              <>
                <Field name="Target Value" placeholder="1000000" />
                <label>
                  Deadline <small>Optional</small>
                  <input type="date" />
                </label>
              </>
            )}
            <Field name="Website" placeholder="https://" />
            <Field name="X / Twitter" placeholder="@handle" />
          </div>
          <div className="curvenote">
            <BarChart3 />
            <p>
              <b>Fair bonding curve launch</b>
              <small>
                Trading begins immediately. Liquidity migrates automatically at
                graduation.
              </small>
            </p>
            <strong>$30K GRADUATION</strong>
          </div>
          <button className="dark submit">
            {type === "point" ? "Launch Token" : "Launch Milestone"}
            <ArrowRight />
          </button>
        </form>
      </main>
    </Shell>
  );
}
function Field({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <label>
      {name}
      <input required placeholder={placeholder} />
    </label>
  );
}
function Title({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="title">
      <label>{eyebrow}</label>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function Explore({ mile = false }: { mile?: boolean }) {
  const [sort, setSort] = useState("Trending");
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="DISCOVER"
          title={mile ? "Explore Milestones" : "Explore Points"}
          text={
            mile
              ? "Turn Goals Into Markets."
              : "Discover the point systems becoming community economies."
          }
        />
        <div className="tabs">
          {[
            "Trending",
            mile ? "Closest to Goal" : "Newest",
            "Market Cap",
            "Volume",
            "Graduated",
          ].map((x) => (
            <button
              className={sort === x ? "active" : ""}
              onClick={() => setSort(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        {mile ? (
          <div className="milegrid">
            {[...milestones, ...milestones].map((m, i) => (
              <Link href={`/token/0xm${i}`} className="milecard" key={i}>
                <div className="between">
                  <small>#{i + 1}</small>
                  <strong>{m.progress}%</strong>
                </div>
                <h3>{m.name}</h3>
                <p>
                  ${m.ticker} · {m.cap}
                </p>
                <div className="progress">
                  <i style={{ width: `${m.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid explore">
            {[...tokens, ...tokens, ...tokens.slice(0, 4)]
              .flat()
              .map((t, i) => (
                <Card t={t} key={i} />
              ))}
          </div>
        )}
      </main>
    </Shell>
  );
}
function TokenPage() {
  const [side, setSide] = useState("BUY"),
    [amt, setAmt] = useState("0.5");
  return (
    <Shell>
      <main className="page">
        <div className="tokenhead">
          <i className="coin" style={{ background: "#25D695" }}>H</i>
          <div>
            <label>PERPS & TRADING</label>
            <h1>
              Hyperliquid Points <span>$HYPE</span>
            </h1>
            <p>Created by 0x83...832 · 12 days ago</p>
          </div>
          <button className="light">
            <Heart /> Watch
          </button>
        </div>
        <div className="stats">
          {[
            ["Market Cap", "$1.24M"],
            ["Price", "$0.00412"],
            ["24H", "+128.5%"],
            ["Volume", "$284.9K"],
            ["Holders", "4,821"],
            ["Transactions", "18,420"],
          ].map((x) => (
            <div key={x[0]}>
              <small>{x[0]}</small>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
        <div className="tradelayout">
          <section className="chart">
            <div className="between">
              <div>
                <small>HYPE / ETH</small>
                <h2>
                  $0.00412 <span>+128.5%</span>
                </h2>
              </div>
              <div className="tabs">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((x) => (
                  <button className={x === "1H" ? "active" : ""} key={x}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div className="bigchart">
              <ResponsiveContainer>
                <AreaChart
                  data={[
                    12, 17, 15, 24, 22, 30, 27, 38, 44, 39, 51, 58, 64, 75, 83,
                  ].map((v) => ({ v }))}
                >
                  <Area
                    dataKey="v"
                    type="monotone"
                    stroke="#5b8cff"
                    strokeWidth={3}
                    fill="#5b8cff"
                    fillOpacity={0.13}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="curve">
              <div className="between">
                <b>Bonding Curve</b>
                <strong>68%</strong>
              </div>
              <div className="progress">
                <i style={{ width: "68%" }} />
              </div>
              <small>$20,400 of $30,000 graduation market cap</small>
            </div>
          </section>
          <aside className="trade">
            <div className="tradetabs">
              <button
                className={side === "BUY" ? "active" : ""}
                onClick={() => setSide("BUY")}
              >
                BUY
              </button>
              <button
                className={side === "SELL" ? "active sell" : ""}
                onClick={() => setSide("SELL")}
              >
                SELL
              </button>
            </div>
            <label>
              You pay <small>Balance: 2.84 ETH</small>
              <div className="amount">
                <input value={amt} onChange={(e) => setAmt(e.target.value)} />
                <b>ETH</b>
              </div>
            </label>
            <div className="quick">
              {["0.1", "0.5", "1", "MAX"].map((x) => (
                <button
                  onClick={() => setAmt(x === "MAX" ? "2.84" : x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="receive">
              <small>You receive</small>
              <b>≈ {(Number(amt || 0) * 24271).toLocaleString()} HYPE</b>
            </p>
            <button
              className={`dark submit ${side === "SELL" ? "danger" : ""}`}
              onClick={() => toast.success(`${side} order simulated`)}
            >
              {side} $HYPE
            </button>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
function Leaderboard() {
  const [tab, setTab] = useState("TOKENS");
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="COMMUNITY SIGNAL"
          title="Leaderboard"
          text="The points, goals and builders shaping the market."
        />
        <section className="leader">
          <div className="tabs">
            {["TOKENS", "MILESTONES", "CREATORS"].map((x) => (
              <button
                className={tab === x ? "active" : ""}
                onClick={() => setTab(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="table">
            <div className="row head">
              <span>Rank</span>
              <span>
                {tab === "CREATORS"
                  ? "Wallet"
                  : tab === "MILESTONES"
                    ? "Milestone"
                    : "Token"}
              </span>
              <span>Market Cap</span>
              <span>Volume</span>
              <span>24H</span>
            </div>
            {Array.from({ length: 10 }, (_, i) => {
              const t = tokens[i % 8];
              return (
                <div className="row" key={i}>
                  <span>#{i + 1}</span>
                  <span className="who">
                    <i style={{ background: t.color }}>{t.ticker[0]}</i>
                    <b>
                      {tab === "CREATORS"
                        ? `0x${83 + i}...${832 - i}`
                        : tab === "MILESTONES"
                          ? milestones[i % 5].name
                          : t.name}
                    </b>
                    <small>
                      {tab === "CREATORS" ? "Verified creator" : `$${t.ticker}`}
                    </small>
                  </span>
                  <span>{t.cap}</span>
                  <span>${284 - i * 13}K</span>
                  <strong>+{128 - i * 7}.5%</strong>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </Shell>
  );
}
function Profile() {
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="CREATOR PROFILE"
          title="0x83...832"
          text="Building point economies for communities onchain."
        />
        <div className="stats">
          {[
            ["Tokens Created", "14"],
            ["Total Market Cap", "$4.2M"],
            ["All-time Volume", "$980K"],
            ["Followers", "2,418"],
            ["Joined", "Aug 2026"],
            ["Reputation", "98.4"],
          ].map((x) => (
            <div key={x[0]}>
              <small>{x[0]}</small>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
        <div className="grid explore">
          {tokens.slice(0, 5).map((t) => (
            <Card key={t.ticker} t={t} />
          ))}
        </div>
      </main>
    </Shell>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <Logo />
        <p>Every Point Can Be a Coin.</p>
      </div>
      <div>
        {["Explore", "Launch", "Points", "Milestones", "Leaderboard"].map(
          (x) => (
            <Link href={`/${x.toLowerCase()}`} key={x}>
              {x}
            </Link>
          ),
        )}
      </div>
      <div>
        Built on Robinhood Chain<small>● Live on testnet</small>
      </div>
    </footer>
  );
}
export default function App() {
  const p = usePathname();
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options?: unknown) => void;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    context.registerTool(
      {
        name: "start_token_launch",
        title: "Start token launch",
        description:
          "Open the POINTS//FUN token launch flow for a point or milestone.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["point", "milestone"] },
          },
          required: ["type"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input: unknown) => {
          const type = (input as { type: string }).type;
          location.href = `/launch?type=${type}`;
          return { status: "opened", type };
        },
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);
  if (p === "/launch") return <Launch />;
  if (p === "/points" || p === "/explore") return <Explore />;
  if (p === "/milestones") return <Explore mile />;
  if (p === "/leaderboard") return <Leaderboard />;
  if (p.startsWith("/token/")) return <TokenPage />;
  if (p.startsWith("/creator/") || p === "/profile") return <Profile />;
  return <Home />;
}
