"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Heart,
  Landmark,
  MapPin,
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
import CommunityFeeClaim from "@/components/CommunityFeeClaim";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
  isMetaMask?: boolean;
  isRabby?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    phantom?: { ethereum?: EthereumProvider };
    okxwallet?: EthereumProvider;
  }
}

const ROBINHOOD_CHAIN = {
  chainId: "0x1237", // 4663
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
};

async function ensureRobinhoodChain(provider: EthereumProvider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ROBINHOOD_CHAIN.chainId }],
    });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [ROBINHOOD_CHAIN],
    });
  }
}

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

type LaunchCity = {
  name: string;
  ticker: string;
  region: "Europe" | "North America" | "South America";
  landmark: string;
  icon: string;
  rank: number;
};

const launchCities: LaunchCity[] = [
  { name: "Istanbul", ticker: "IST", region: "Europe", landmark: "Hagia Sophia", icon: "/cities/istanbul.png", rank: 1 },
  { name: "Moscow", ticker: "MOW", region: "Europe", landmark: "Saint Basil's Cathedral", icon: "/cities/moscow.png", rank: 2 },
  { name: "London", ticker: "LDN", region: "Europe", landmark: "Big Ben", icon: "/cities/london.png", rank: 3 },
  { name: "Paris", ticker: "PAR", region: "Europe", landmark: "Eiffel Tower", icon: "/cities/paris.png", rank: 4 },
  { name: "Madrid", ticker: "MAD", region: "Europe", landmark: "Puerta de Alcalá", icon: "/cities/madrid.png", rank: 5 },
  { name: "Barcelona", ticker: "BCN", region: "Europe", landmark: "Sagrada Família", icon: "/cities/barcelona.png", rank: 6 },
  { name: "Mexico City", ticker: "MEX", region: "North America", landmark: "Angel of Independence", icon: "/cities/mexico-city.png", rank: 1 },
  { name: "New York City", ticker: "NYC", region: "North America", landmark: "Statue of Liberty", icon: "/cities/new-york.png", rank: 2 },
  { name: "Los Angeles", ticker: "LAX", region: "North America", landmark: "Hollywood Sign", icon: "/cities/los-angeles.png", rank: 3 },
  { name: "Toronto", ticker: "TOR", region: "North America", landmark: "CN Tower", icon: "/cities/toronto.png", rank: 4 },
  { name: "Santo Domingo", ticker: "SDQ", region: "North America", landmark: "Columbus Lighthouse", icon: "/cities/santo-domingo.png", rank: 5 },
  { name: "Guadalajara", ticker: "GDL", region: "North America", landmark: "Guadalajara Cathedral", icon: "/cities/guadalajara.png", rank: 6 },
  { name: "São Paulo", ticker: "SAO", region: "South America", landmark: "Altino Arantes Building", icon: "/cities/sao-paulo.png", rank: 1 },
  { name: "Buenos Aires", ticker: "BUE", region: "South America", landmark: "Obelisk", icon: "/cities/buenos-aires.png", rank: 2 },
  { name: "Bogotá", ticker: "BOG", region: "South America", landmark: "Monserrate", icon: "/cities/bogota.png", rank: 3 },
  { name: "Lima", ticker: "LIM", region: "South America", landmark: "Plaza Mayor", icon: "/cities/lima.png", rank: 4 },
  { name: "Rio de Janeiro", ticker: "RIO", region: "South America", landmark: "Christ the Redeemer", icon: "/cities/rio.png", rank: 5 },
  { name: "Santiago", ticker: "SCL", region: "South America", landmark: "Gran Torre Santiago", icon: "/cities/santiago.png", rank: 6 },
];
const tokens: Token[] = [];
const milestones: Array<{ name: string; ticker: string; cap: string; change: string; progress: number }> = [];
function Logo() {
  return (
    <Link href="/" className="logo" aria-label="EARTH ONLINE home">
      <span className="logoMark"><img src="/earth-token.png" alt="" /></span>
      <b className="wordmark">
        <span className="brandEarth">EARTH</span>
        <span className="brandOnline"><i aria-hidden="true" />ONLINE</span>
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

function findWalletProvider(name: string): EthereumProvider | undefined {
  const injected = window.ethereum;
  const providers = injected?.providers?.length ? injected.providers : injected ? [injected] : [];
  if (name === "Rabby") return providers.find((p) => p.isRabby);
  if (name === "Coinbase Wallet") return providers.find((p) => p.isCoinbaseWallet);
  if (name === "Phantom") return window.phantom?.ethereum ?? providers.find((p) => p.isPhantom);
  if (name === "OKX Wallet") return window.okxwallet ?? providers.find((p) => p.isOkxWallet || p.isOKExWallet);
  if (name === "MetaMask") return providers.find((p) => p.isMetaMask && !p.isRabby) ?? injected;
  return undefined;
}

function publishConnectedAccount(address: string) {
  if (address) window.localStorage.setItem("earth-account", address);
  else window.localStorage.removeItem("earth-account");
  window.dispatchEvent(new CustomEvent("earth-account-changed", { detail: address }));
}

function Shell({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState(false),
    [menu, setMenu] = useState(false),
    [account, setAccount] = useState(""),
    [connecting, setConnecting] = useState("");
  const path = usePathname(),
    router = useRouter();

  useEffect(() => {
    const walletName = window.localStorage.getItem("earth-wallet");
    if (!walletName) return;
    const provider = findWalletProvider(walletName);
    if (!provider) return;
    provider.request({ method: "eth_accounts" }).then((result) => {
      const accounts = result as string[];
      if (accounts?.[0]) {
        setAccount(accounts[0]);
        publishConnectedAccount(accounts[0]);
      }
    }).catch(() => undefined);
    const handleAccounts = (accounts: unknown) => {
      const nextAccount = (accounts as string[])?.[0] ?? "";
      setAccount(nextAccount);
      publishConnectedAccount(nextAccount);
    };
    provider.on?.("accountsChanged", handleAccounts);
    return () => provider.removeListener?.("accountsChanged", handleAccounts);
  }, []);

  useEffect(() => {
    const openWallet = () => setWallet(true);
    window.addEventListener("earth-open-wallet", openWallet);
    return () => window.removeEventListener("earth-open-wallet", openWallet);
  }, []);

  async function connectWallet(name: string) {
    const provider = findWalletProvider(name);
    if (!provider) {
      toast.error(`${name} was not detected. Install or open its browser extension first.`);
      return;
    }
    setConnecting(name);
    try {
      await ensureRobinhoodChain(provider);
      const result = await provider.request({ method: "eth_requestAccounts" });
      const address = (result as string[])?.[0];
      if (!address) throw new Error("No account was returned by the wallet.");
      window.localStorage.setItem("earth-wallet", name);
      setAccount(address);
      publishConnectedAccount(address);
      setWallet(false);
      toast.success(`${name} connected to Robinhood Chain`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection was rejected.";
      toast.error(message);
    } finally {
      setConnecting("");
    }
  }
  return (
    <>
      <header>
        <Logo />
        <nav className={menu ? "open" : ""}>
          {[
            ["World", "/"],
            ["Cities", "/explore"],
            ["Launch City", "/launch"],
            ["Citizen Levels", "/points"],
            ["City Rankings", "/leaderboard"],
            ["My Passport", "/profile"],
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
              placeholder="Search cities and regions..."
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
            <span>{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect Wallet"}</span>
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
            <p>Choose a wallet to connect to Robinhood Chain.</p>
            {["MetaMask", "Rabby", "Coinbase Wallet", "Phantom", "OKX Wallet"].map((w) => (
              <button
                className="walletrow"
                key={w}
                disabled={Boolean(connecting)}
                onClick={() => connectWallet(w)}
              >
                <WalletLogo name={w} />
                <span>{connecting === w ? "Connecting…" : w}</span>
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
function EmptyLaunchState() {
  return (
    <div className="emptylaunch">
      <Rocket />
      <h3>No city tokens have launched yet</h3>
      <p>Choose one of the available cities and become its first creator.</p>
      <Link className="dark" href="/launch">Launch the first city <ArrowRight size={16} /></Link>
    </div>
  );
}
function VerifiedDataEmpty({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="emptylaunch">
      <ShieldCheck />
      <h3>{title}</h3>
      <p>{text}</p>
      <small>Only verified onchain records will be displayed here.</small>
    </div>
  );
}
function HeroArt() {
  return (
    <div className="art">
      <div className="bubble" />
      <div className="float f1">
        <small>NORTH AMERICA</small>
        <b>6 cities ready to launch</b>
      </div>
      <div className="float f2">
        <small>EUROPE</small>
        <b>6 cities ready to launch</b>
      </div>
      <div className="bigcoin">
        <i>E</i>
        <small>$EARTH MAIN TOKEN</small>
        <b>NOT LAUNCHED</b>
      </div>
      <div className="float mile">
        <div className="between">
          <small>MILESTONE</small>
          <b>0%</b>
        </div>
          <strong>Waiting for the first city</strong>
        <div className="progress">
          <i style={{ width: "0%" }} />
        </div>
        <p>Build the city together.</p>
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
              <Sparkles size={14} /> THE CITY TOKEN LAUNCHPAD
            </label>
            <h1>
              Own Your City.
              <br />
              Build Its <span>Future.</span>
            </h1>
            <h2>Launch and trade community-owned city tokens.</h2>
            <p>
              Every city becomes an onchain community. Trade city tokens, earn
              citizen status and grow a transparent treasury for local culture,
              events and community-led projects.
            </p>
            <div className="buttons">
              <Link className="dark" href="/launch">
                Launch a City <ArrowRight size={17} />
              </Link>
              <Link className="light" href="/explore">
                Explore Cities
              </Link>
            </div>
          </div>
          <HeroArt />
        </section>
        <section className="features">
          {[
            [Rocket, "Launch Any City", "One city, one community token"],
            [ShieldCheck, "Europe & Americas", "The first regions now live"],
            [Users, "Shared Development", "City DEV and main DEV both funded"],
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
        <section className="flywheel">
          <div className="flytitle">
            <label>PROTOCOL FLYWHEEL</label>
            <h2>Two tokens. Two transparent fee routes.</h2>
            <p>Main-token fees build the ecosystem; city-token fees support creators and $EARTH.</p>
          </div>
          <div className="splitcard buyback">
            <small>$EARTH MAIN TOKEN</small>
            <strong>Launched through Pons</strong>
            <p>Main-token supply, trading pool and fees follow the immutable Pons launch configuration.</p>
          </div>
          <ArrowRight className="splitarrow" />
          <div className="splitcard community">
            <small>CITY TOKENS</small>
            <strong>50% Buyback · 30% City · 20% Main</strong>
            <p>50% buys back $EARTH, 30% supports city creator community building, and 20% supports main-token creator community building.</p>
          </div>
        </section>
        <section className="earthshowcase" aria-label="$EARTH main token">
          <div className="earthidentity">
            <div className="earthmark"><img src="/earth-token.png" alt="$EARTH token" /></div>
            <div>
              <label>MAIN ECOSYSTEM TOKEN</label>
              <h2>$EARTH</h2>
              <p>The reserve asset connecting every city economy.</p>
            </div>
          </div>
          <div className="earthpending">
            <span>NOT LAUNCHED</span>
            <strong>Main token information will appear here.</strong>
            <p>Verified contract, live price and market data will be shown after launch.</p>
          </div>
          <div className="earthplaceholders" aria-label="Main token data pending">
            <div><small>CONTRACT</small><b>—</b></div>
            <div><small>PRICE</small><b>—</b></div>
            <div><small>MARKET CAP</small><b>—</b></div>
          </div>
        </section>
        <section className="market">
          <div className="tabs">
            {[
              "Trending",
              "Europe",
              "North America",
              "South America",
              "Community Goals",
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
          <div className="regionnotice">
            <b>NOW OPEN</b> Europe · North America · South America
            <span>Asia, Africa, Middle East and Oceania are coming soon.</span>
          </div>
          <div className="sectionhead">
            <div>
              <label>LIVE CITY MARKETS</label>
              <h2>Trending Cities</h2>
              <p>
                Discover cities, join their communities and follow treasury growth.
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
              {!shown.length && <EmptyLaunchState />}
            </div>
            <aside>
              <div className="asidehead">
                <span>
                  <TrendingUp />
                </span>
                <div>
                  <small>CITY GOALS</small>
                  <h3>Community milestones</h3>
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
              {!milestones.length && <p className="emptyaside">No community milestones yet.</p>}
            </aside>
          </div>
        </section>
        <section className="manifesto">
          <label>EVERY TRADE BUILDS THE WORLD.</label>
          <h2>
            City tokens.
            <br />
            <span>Real communities.</span>
          </h2>
          <p>
            A transparent fee flywheel supports the main token and the people building each city.
          </p>
        </section>
        <section className="cta">
          <div>
            <label>PUT YOUR CITY ONCHAIN</label>
            <h2>
              Your City.
              <br />
              Your Movement.
            </h2>
            <p>
              Create a city token, open its market and give the community a
              transparent wallet for long-term building.
            </p>
            <Link className="dark" href="/launch?type=milestone">
              Launch Your City <ArrowRight />
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
  const [region, setRegion] = useState<LaunchCity["region"]>("Europe"),
    [selectedTicker, setSelectedTicker] = useState(""),
    [launchAccount, setLaunchAccount] = useState(() =>
      typeof window === "undefined" ? "" : localStorage.getItem("earth-account") || "",
    );
  useEffect(() => {
    const handleAccount = (event: Event) => setLaunchAccount((event as CustomEvent<string>).detail || "");
    window.addEventListener("earth-account-changed", handleAccount);
    return () => window.removeEventListener("earth-account-changed", handleAccount);
  }, []);
  const published = new Set(tokens.map((token) => token.ticker));
  const availableCities = launchCities.filter(
    (city) => city.region === region && !published.has(city.ticker),
  );
  const selectedCity = launchCities.find((city) => city.ticker === selectedTicker);
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="PERMISSIONLESS LAUNCH"
          title="Launch a City Token"
          text="Put any city onchain and open its community-owned market."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedCity) return;
            if (!launchAccount) {
              window.dispatchEvent(new Event("earth-open-wallet"));
              toast.error("Connect a wallet before launching a city token.");
              return;
            }
            toast.error("The verified city launch contract is not configured. No transaction was submitted.");
          }}
        >
          <div className="formhead">
            <div>
              <label>CITY TOKEN LAUNCH</label>
              <h2>Choose an Available City</h2>
            </div>
            <span>01 — CITY</span>
          </div>
          <div className="regionpicker" role="group" aria-label="Choose a launch region">
            {(["Europe", "North America", "South America"] as const).map((item) => (
              <button type="button" className={region === item ? "active" : ""} onClick={() => { setRegion(item); setSelectedTicker(""); }} key={item}>
                <MapPin size={15} /> {item}
              </button>
            ))}
          </div>
          <div className="citypicker">
            {availableCities.map((city) => (
              <button type="button" key={city.ticker} className={selectedTicker === city.ticker ? "active" : ""} onClick={() => setSelectedTicker(city.ticker)}>
                <span className="cityavatar"><img src={city.icon} alt="" /></span>
                <span><b>#{city.rank} {city.name}</b><small>{city.landmark}</small></span>
                <strong>${city.ticker}</strong>
              </button>
            ))}
            {!availableCities.length && <div className="cityempty">All cities in this region have already launched.</div>}
          </div>
          {selectedCity && (
            <div className="selectedcity">
              <span className="cityavatar large"><img src={selectedCity.icon} alt={`${selectedCity.name} token avatar`} /></span>
              <div><small>AUTO-GENERATED TOKEN AVATAR</small><b>{selectedCity.name} · {selectedCity.landmark}</b></div>
              <Landmark />
            </div>
          )}
          <div className="formgrid">
            <label>City Name<input required readOnly value={selectedCity?.name || "Select a city above"} /></label>
            <label>Ticker<input required readOnly value={selectedCity ? `$${selectedCity.ticker}` : "Generated automatically"} /></label>
            <label className="full">
              Description <small>(Optional)</small>
              <textarea
                placeholder="Describe the city community and how its treasury will be used..."
              />
            </label>
            <label>Region<input readOnly value={selectedCity?.region || region} /></label>
            <Field name="Website" placeholder="https://" />
            <Field name="X / Twitter" placeholder="@handle" />
          </div>
          <div className="curvenote">
            <BarChart3 />
            <p>
              <b>Fee split enforced by contract</b>
              <small>
                City launches open only after the Pons $EARTH contract is bound onchain. Fees then split 50% buyback, 30% city and 20% main community.
              </small>
            </p>
            <strong>50 / 30 / 20</strong>
          </div>
          <div className={`launchwallet ${launchAccount ? "connected" : ""}`}>
            <Wallet size={18} />
            <div>
              <b>{launchAccount ? "Creator wallet connected" : "Wallet required to launch"}</b>
              <small>{launchAccount ? `${launchAccount.slice(0, 8)}…${launchAccount.slice(-6)} · receives the city creator's 30% fee share` : "The wallet that launches the city token receives its 30% creator fee share."}</small>
            </div>
          </div>
          <button className="dark submit" disabled={!selectedCity}>
            {!selectedCity ? "Choose a City to Continue" : !launchAccount ? "Connect Wallet to Launch" : "Pons $EARTH Binding Required"}
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
      {name} <small>(Optional)</small>
      <input placeholder={placeholder} />
    </label>
  );
}
function PointsProgram() {
  const tiers = [
    { name: "Visitor", amount: "1+", benefit: "City passport stamp", color: "#8D9AAA" },
    { name: "Resident", amount: "10K+", benefit: "Community proposal access", color: "#2BAE76" },
    { name: "Citizen", amount: "50K+", benefit: "Priority city events", color: "#E2A928" },
    { name: "Metropolitan", amount: "250K+", benefit: "Maximum community status", color: "#5B8CFF" },
  ];
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="YOUR ONCHAIN PASSPORT"
          title="Citizen Levels"
          text="Your identity in each city is determined by the city tokens in your wallet."
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
          <div><b>City specific</b><p>Every city token gives your wallet a separate local identity.</p></div>
          <div><b>Community access</b><p>Higher levels can unlock proposals, events and local benefits.</p></div>
          <div><b>Onchain only</b><p>Levels will activate only after verified contract balances are indexed.</p></div>
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
          title={mile ? "Community Goals" : "Explore Cities"}
          text={
            mile
              ? "Track the goals city communities are building toward."
              : "Discover city tokens and join communities around the world."
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
            {milestones.map((m, i) => (
              <div className="milecard" key={m.ticker}>
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
              </div>
            ))}
            {!milestones.length && <EmptyLaunchState />}
          </div>
        ) : (
          <div className="grid explore">
            {tokens.map((t) => <Card t={t} key={t.address} />)}
            {!tokens.length && <EmptyLaunchState />}
          </div>
        )}
      </main>
    </Shell>
  );
}
function TokenPage() {
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="VERIFIED ONCHAIN DATA"
          title="City Token"
          text="This page does not have a verified deployed token contract to read yet."
        />
        <VerifiedDataEmpty
          title="No verified token data"
          text="Price, volume, holders, balances and trades will appear after a city token is launched through the deployed contract and indexed from chain."
        />
      </main>
    </Shell>
  );
}
function Leaderboard() {
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="COMMUNITY SIGNAL"
          title="Leaderboard"
          text="Rankings are generated only from verified onchain balances and activity."
        />
        <VerifiedDataEmpty
          title="No verified rankings yet"
          text="The leaderboard will remain empty until launched city contracts have indexed holder and trading records."
        />
      </main>
    </Shell>
  );
}
function Profile() {
  const [account, setAccount] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("earth-account") || "",
  );
  useEffect(() => {
    const handleAccount = (event: Event) =>
      setAccount((event as CustomEvent<string>).detail || "");
    window.addEventListener("earth-account-changed", handleAccount);
    return () => window.removeEventListener("earth-account-changed", handleAccount);
  }, []);
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="EARTH PASSPORT"
          title={account ? `${account.slice(0, 8)}…${account.slice(-6)}` : "Wallet not connected"}
          text={account ? "This connected wallet has no indexed city-token activity yet." : "Connect a wallet to view its verified onchain city activity."}
        />
        <VerifiedDataEmpty
          title={account ? "No verified wallet activity" : "Connect your wallet"}
          text={account ? "Holdings, launches and fee distributions will appear only after they are read from deployed contracts." : "No portfolio values or balances are shown until a wallet and verified contracts are available."}
        />
        <CommunityFeeClaim account={account} />
      </main>
    </Shell>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <Logo />
        <p>Own Your City. Build Its Future.</p>
      </div>
      <div>
        {[["Cities", "/explore"], ["Launch City", "/launch"], ["Citizen Levels", "/points"], ["City Rankings", "/leaderboard"], ["Passport", "/profile"]].map(
          ([label, href]) => <Link href={href} key={label}>{label}</Link>,
        )}
      </div>
      <div>
        City tokens for everyone<small>50% buyback · 30% city DEV · 20% main DEV</small>
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
        title: "Launch a city token",
        description:
          "Open the EARTH ONLINE launch flow for a city or district token.",
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
