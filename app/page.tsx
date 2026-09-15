"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
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
  "OKX Wallet":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%23000'/%3E%3Cg fill='%23fff'%3E%3Cpath d='M8 8h9v9H8zM31 8h9v9h-9zM19.5 19.5h9v9h-9zM8 31h9v9H8zM31 31h9v9h-9z'/%3E%3C/g%3E%3C/svg%3E",
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
            ["Home", "/"],
            ["Launchpad", "/explore"],
            ["Create", "/launch"],
            ["Holder Levels", "/points"],
            ["Top Holders", "/leaderboard"],
            ["Portfolio", "/profile"],
          ].map(([x, href]) => {
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
            {["MetaMask", "Rabby", "Coinbase Wallet", "Phantom", "OKX Wallet"].map((w) => (
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
        <small>HOLDER LEVEL</small>
        <b>
          GOLD <em>↑</em>
        </b>
      </div>
      <div className="float mile">
        <div className="between">
          <small>MILESTONE</small>
          <b>78%</b>
        </div>
          <strong>1,000 Community Holders</strong>
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
              <Sparkles size={14} /> PERMISSIONLESS TOKEN LAUNCHPAD
            </label>
            <h1>
              Launch Any Token.
              <br />
              Grow Its <span>Community.</span>
            </h1>
            <h2>Create, fund and discover community tokens onchain.</h2>
            <p>
              Anyone can launch a token without approval. Holders progress from
              Bronze to Diamond as their position grows and unlock stronger
              community identity and launch benefits.
            </p>
            <div className="buttons">
              <Link className="dark" href="/launch">
                Launch a Token <ArrowRight size={17} />
              </Link>
              <Link className="light" href="/explore">
                Explore Launches
              </Link>
            </div>
          </div>
          <HeroArt />
        </section>
        <section className="features">
          {[
            [Rocket, "Open Launch", "Anyone can create a token"],
            [ShieldCheck, "Transparent Rules", "Contract details shown clearly"],
            [Users, "Holder Identity", "Bronze to Diamond levels"],
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
              <label>LIVE LAUNCHES</label>
              <h2>Trending Community Tokens</h2>
              <p>
                Discover new launches, follow their progress and join early.
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
          <label>HOLDING BECOMES IDENTITY.</label>
          <h2>
            Open launches.
            <br />
            <span>Stronger communities.</span>
          </h2>
          <p>
            Every holder has a visible level based on their current token balance.
          </p>
        </section>
        <section className="cta">
          <div>
            <label>LAUNCH WITHOUT PERMISSION</label>
            <h2>
              Your Token.
              <br />
              Your Community.
            </h2>
            <p>
              Set the token details, launch terms and holder-level thresholds,
              then publish the project onchain.
            </p>
            <Link className="dark" href="/launch?type=milestone">
              Create a Token <ArrowRight />
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
            <label>LAUNCH DRAFT READY</label>
            <h1>Token Launch Created</h1>
            <p>Connect the launch contract before publishing it onchain.</p>
            <div className="buttons">
              <Link className="dark" href="/token/0xgxp">
                View Launch
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
          eyebrow="PERMISSIONLESS LAUNCH"
          title="Launch Your Token"
          text="Anyone can configure a token launch and publish it onchain."
        />
        <div className="types">
          <button
            className={type === "point" ? "active" : ""}
            onClick={() => setType("point")}
          >
            <i>P</i>
            <b>
              TOKEN <small>Create a standard community launch</small>
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
              MILESTONE <small>Launch around a community goal</small>
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
                  ? "Configure Your Token"
                  : "Create a Milestone Token"}
              </h2>
            </div>
            <span>01 — DETAILS</span>
          </div>
          <div className="formgrid">
            <Field
              name={type === "point" ? "Token Name" : "Milestone Name"}
              placeholder={type === "point" ? "Community Token" : "1,000 Holders"}
            />
            <Field
              name="Ticker"
              placeholder={type === "point" ? "FUN" : "HOLD1K"}
            />
            <label className="full">
              Description
              <textarea
                required
                placeholder="Explain the project, launch terms and community..."
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
              name={type === "point" ? "Total Supply" : "Current Value"}
              placeholder={type === "point" ? "1000000000" : "780"}
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
              <b>Holder identity included</b>
              <small>
                Bronze, Silver, Gold and Diamond levels update with wallet balances.
              </small>
            </p>
            <strong>ONCHAIN LEVELS</strong>
          </div>
          <button className="dark submit">
            {type === "point" ? "Create Token Launch" : "Create Milestone"}
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
function PointsProgram() {
  const tiers = [
    { name: "Bronze", amount: "1+", benefit: "Holder badge", color: "#B87333" },
    { name: "Silver", amount: "10K+", benefit: "Early launch alerts", color: "#8D9AAA" },
    { name: "Gold", amount: "50K+", benefit: "Priority access", color: "#E2A928" },
    { name: "Diamond", amount: "250K+", benefit: "Maximum allocation", color: "#5B8CFF" },
  ];
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="ONCHAIN HOLDER IDENTITY"
          title="Holder Levels"
          text="Your level is determined by the token balance held in your connected wallet."
        />
        <section className="tiercards">
          {tiers.map((tier, index) => (
            <div className="tiercard" key={tier.name} style={{ "--tier": tier.color } as React.CSSProperties}>
              <span className="tiericon">{index + 1}</span>
              <small>LEVEL {index + 1}</small>
              <h2>{tier.name}</h2>
              <b>{tier.amount} tokens</b>
              <p>{tier.benefit}</p>
            </div>
          ))}
        </section>
        <section className="pointsnotes">
          <div><b>Balance based</b><p>The contract reads the current token balance of each wallet.</p></div>
          <div><b>Project specific</b><p>Each launch may customize its level thresholds and benefits.</p></div>
          <div><b>Always current</b><p>Your identity upgrades or downgrades automatically as holdings change.</p></div>
        </section>
      </main>
    </Shell>
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
              ? "Track shared trading goals and bonus unlocks."
              : "Compare eligible markets by activity and reward potential."
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
  const projectedHolding = Math.floor(Number(amt || 0) * 24271);
  const projectedTier = projectedHolding >= 250000 ? "Diamond" : projectedHolding >= 50000 ? "Gold" : projectedHolding >= 10000 ? "Silver" : projectedHolding > 0 ? "Bronze" : "None";
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
            ["Raised", "$284.9K"],
            ["Holders", "4,821"],
            ["Launch Progress", "68%"],
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
            <div className="earnpreview">
              <span><Sparkles size={16} /> Projected holder level</span>
              <strong>{projectedTier}</strong>
              <small>Based on approximately {projectedHolding.toLocaleString()} HYPE held after this purchase.</small>
            </div>
            <button
              className={`dark submit ${side === "SELL" ? "danger" : ""}`}
              onClick={() => toast.error("Connect the live trading contract to submit this transaction.")}
            >
              CONNECT CONTRACT TO {side}
            </button>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
function Leaderboard() {
  const [tab, setTab] = useState("HOLDERS");
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="COMMUNITY SIGNAL"
          title="Leaderboard"
          text="Discover the strongest holders and fastest-growing launches."
        />
        <section className="leader">
          <div className="tabs">
            {["HOLDERS", "LAUNCHES", "CREATORS"].map((x) => (
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
                {tab === "HOLDERS"
                  ? "Wallet"
                  : tab === "CREATORS"
                    ? "Creator"
                    : "Token"}
              </span>
              <span>Holdings</span>
              <span>Level</span>
              <span>Allocation</span>
            </div>
            {Array.from({ length: 10 }, (_, i) => {
              const t = tokens[i % 8];
              return (
                <div className="row" key={i}>
                  <span>#{i + 1}</span>
                  <span className="who">
                    <i style={{ background: t.color }}>{t.ticker[0]}</i>
                    <b>
                      {tab === "HOLDERS"
                        ? `0x${83 + i}...${832 - i}`
                        : tab === "CREATORS"
                          ? `0x${93 + i}...${742 - i}`
                          : t.name}
                    </b>
                    <small>
                      {tab === "HOLDERS" ? `Holds $${t.ticker}` : `$${t.ticker}`}
                    </small>
                  </span>
                  <span>{(284000 - i * 13000).toLocaleString()}</span>
                  <span>{i < 2 ? "Diamond" : i < 5 ? "Gold" : "Silver"}</span>
                  <strong>{(2 - i * .08).toFixed(2)}×</strong>
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
          eyebrow="HOLDER PORTFOLIO"
          title="0x83...832"
          text="Your launches, holdings, identity levels and claimable allocations."
        />
        <div className="stats">
          {[
            ["Portfolio Value", "$28.4K"],
            ["Highest Level", "Gold"],
            ["Launches Joined", "12"],
            ["Tokens Created", "2"],
            ["Claimable", "$1,840"],
            ["Wallet Status", "Connected"],
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
        <p>Launch Any Token. Grow Its Community.</p>
      </div>
      <div>
        {[["Launchpad", "/explore"], ["Create", "/launch"], ["Holder Levels", "/points"], ["Top Holders", "/leaderboard"], ["Portfolio", "/profile"]].map(
          ([label, href]) => <Link href={href} key={label}>{label}</Link>,
        )}
      </div>
      <div>
        Permissionless token launches<small>Holder levels onchain</small>
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
  if (p === "/points") return <PointsProgram />;
  if (p === "/explore") return <Explore />;
  if (p === "/milestones") return <Explore mile />;
  if (p === "/leaderboard") return <Leaderboard />;
  if (p.startsWith("/token/")) return <TokenPage />;
  if (p.startsWith("/creator/") || p === "/profile") return <Profile />;
  return <Home />;
}
