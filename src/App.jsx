import { Fragment, useEffect, useState, useRef } from "react";
import { getAllDatabases, openDatabase } from "./db/index";
import debounce from "./config/debounce";
import "./styles/App.css";
import "./styles/common.css";
import "./styles/setup-com.css";

function App() {
  /* **************************************************************************************************** */
  const appSideRef = useRef(); // 用于操作侧边Ref
  const appSide_FixedMenuRef = useRef(); // 用于操作侧边固定头部菜单Ref
  const appSide_MobileMenuRef = useRef(); // 在移动端时用于操作侧边固定头部菜单Ref
  const appSide_MenuItemRef = useRef(); // 用于操作侧边菜单栏Ref
  const appMainRef = useRef(); // 用于操作主区域Ref

  // 侧边栏操作
  const handleToggleSidesheet = () => {
    const currentWindowWidth = document.documentElement.clientWidth; // 移动端
    if (currentWindowWidth <= 750) {
      document.body.classList.toggle("active-overflow");
      appSideRef.current.classList.toggle("active-mobile");
      appMainRef.current.classList.add("active");
      // appSide_FixedMenuRef.current.children[0].classList.remove("active");
    } else {
      // pc端
      appSideRef.current.classList.toggle("active-pc");
      appMainRef.current.classList.toggle("active");
      // appSide_FixedMenuRef.current.classList.toggle("active-pc");
      // appSide_FixedMenuRef.current.children[0].classList.toggle("active");
    }
  };

  useEffect(() => {
    const rsize = () => {
      const currentWindowWidth = document.documentElement.clientWidth; // 检查DOM元素是否存在
      if (currentWindowWidth <= 750) {
        appSideRef.current.classList.remove("active-pc");
        appSideRef.current.classList.add("active-mobile");
        // appSide_FixedMenuRef.current.classList.remove("active-pc");
        appSide_MobileMenuRef.current.classList.add("active");
        appMainRef.current.classList.add("active");
      } else {
        appSideRef.current.classList.remove("active-pc");
        appSideRef.current.classList.remove("active-mobile");
        // appSide_FixedMenuRef.current.classList.remove("active-pc");
        appSide_MobileMenuRef.current.classList.remove("active");
        appMainRef.current.classList.remove("active");
      }
    }; // 初次执行一次rsize
    rsize();
    const debouncedHandleResize = debounce(rsize, 200);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

  /* **************************************************************************************************** */
  // 菜单选择激活
  const [databases, setDatabases] = useState([]);

  // 初始化数据库
  const initialAllDatabases = async () => {
    try {
      const result = await getAllDatabases();
      if (result.length <= 0) return;
      for (let i = 0; i < result.length; i++) {
        setDatabases([...databases, { id: 12, name: result[i].name, version: result[i].version }]);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    initialAllDatabases();
  }, []);

  useEffect(() => {
    console.log(databases);
  }, [databases]);

  const [activeMenuItem, setActiveMenuItem] = useState(() => localStorage.getItem("activeMenuItem") || 0);
  const activeMenuItemRefs = useRef([]);

  // 控制菜单栏的行为和状态
  const handleActiveMenuItem = (id) => {
    if (activeMenuItemRefs.current.length <= 0) return;
    if (activeMenuItem !== id) {
      if (activeMenuItemRefs.current[activeMenuItem]) {
        activeMenuItemRefs.current[activeMenuItem].style.background = "transparent";
      }

      if (activeMenuItemRefs.current[id]) {
        const theme = document.body.getAttribute("theme-mode");
        activeMenuItemRefs.current[id].style.background = theme === "light" ? "#dfdcdc" : "#124cd5cf";
      }
      setActiveMenuItem(id);
      localStorage.setItem("activeMenuItem", id);
    }
  };

  useEffect(() => {
    if (activeMenuItem === 0) return;
    if (activeMenuItemRefs.current.length <= 0) return;
    const theme = document.body.getAttribute("theme-mode");
    activeMenuItemRefs.current[activeMenuItem].style.background = theme === "light" ? "#dfdcdc" : "#124cd5cf";
  }, [activeMenuItem]);

  /* **************************************************************************************************** */
  // 工作簿（数据库名）
  // const [database, setDatabase] = useState("");
  // 提示错误信息
  // const [error, setError] = useState("");
  // 创建数据库
  const handleCreateCreatebase = async () => {
    let i = 1;
    try {
      // database禁止为空
      // if (database === "") throw new String("请创建数据库");
      // 将非法字符拦截
      // if (database.match(/null|undefined|\s|\\|\W/gi)) throw new String("非法字符，请使用数字、字符、下划线'_'。");
      // 调用数据库
      await openDatabase(`Worksheet${i++}`);
    } catch (error) {
      console.error("create database faild:", error);
    }
  };
  /* **************************************************************************************************** */

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  const closeModal = () => setModalOpen(false);

  /* **************************************************************************************************** */
  // 设置列表项
  const setupItems = [
    { id: 10010, name: "通用设置", content: <GeneralSetUpComponent /> },
    { id: 10011, name: "数据管理", content: <DataManageComponent /> },
    { id: 10012, name: "语音", content: <SpeechSoundComponent /> },
  ];
  // 激活样式及内容
  const [activeSetupItems, setActiveSetupItems] = useState({ index: 0, id: setupItems[0].id });
  const activeSetupItemRefs = useRef([]);

  // 根据id激活样式，根据index显示内容
  const handleActiveSetupItems = (id, index) => {
    const perActiveSetupMenu = activeSetupItems.id;
    if (perActiveSetupMenu != id) {
      if (activeSetupItemRefs.current[perActiveSetupMenu]) {
        activeSetupItemRefs.current[perActiveSetupMenu].style.background = "transparent";
      }
      if (activeSetupItemRefs.current[id]) {
        const theme = document.body.getAttribute("theme-mode");
        activeSetupItemRefs.current[id].style.background = theme === "light" ? "#dfdcdc" : "#124cd5cf";
      }
      setActiveSetupItems({ ...activeSetupItems, index, id });
    }
  };

  useEffect(() => {
    const theme = document.body.getAttribute("theme-mode");
    activeSetupItemRefs.current[activeSetupItems.id].style.background = theme === "light" ? "#dfdcdc" : "#124cd5cf";
  }, []);

  /* **************************************************************************************************** */

  const [functionTableVisible, setFunctionTableVisible] = useState(false);

  const functionTableRef = useRef(null);

  const handleFunctionTable = (event) => setFunctionTableVisible(!functionTableVisible);

  return (
    <Fragment>
      {/* side layout */}
      <aside className="app-aside" ref={appSideRef}>
        <section className="app-aside-mask" onClick={handleToggleSidesheet}></section>
        <section className="app-aside-menu">
          <article className="app-aside-menu-1" ref={appSide_FixedMenuRef}>
            search box
          </article>
          <article className="app-aside-menu-2" ref={appSide_MenuItemRef}>
            {databases.map((item) => (
              <nav
                key={item.id}
                className="app-aside-menu-2-item"
                onClick={() => handleActiveMenuItem(item.id)}
                ref={(el) => (activeMenuItemRefs.current[item.id] = el)}>
                {item.name}
              </nav>
            ))}
          </article>
          <article className="app-aside-menu-3">
            <AppPopover
              content={
                <section className="app-aside-menu-3-setup-content">
                  <article>我的</article>
                  <article>帮忙与常见问题</article>
                  <article onClick={openModal}>设置</article>
                </section>
              }
              modal="top-right-fixed"
              trigger="click">
              <section className="app-aside-menu-3-setup">
                <article className="app-aside-menu-3-setup-icon"></article>
              </section>
            </AppPopover>
          </article>
        </section>
      </aside>
      {/* main layout */}
      <main className="app-main" ref={appMainRef}>
        {/* main nav */}
        <nav className="app-main-nav">
          <section className="app-aside-action-menu" onClick={handleToggleSidesheet} ref={appSide_MobileMenuRef}>
            <article></article>
          </section>
          <section className="app-aside-action-work">&#9924;</section>
        </nav>

        {/* function table component */}
        <nav ref={functionTableRef} className={`app-function-table ${functionTableVisible ? "active" : ""}`}>
          <article
            className={`app-function-table-icon ${functionTableVisible ? "active" : ""}`}
            onClick={handleFunctionTable}>
            &#9711;
          </article>
          <article className={`app-function-table-content ${functionTableVisible ? "active" : ""}`}>
            <div>功能1</div>
            <div>功能2</div>
            <div>功能3</div>
            <div>功能4</div>
            <div>功能5</div>
            <div>功能5</div>
            <div>功能5</div>
            <div>功能5</div>
            <div>功能5</div>
          </article>
        </nav>

        <main className="app-main-content">
          <p>辅助追踪样品实时流转状态并撰写测试排配报告。</p>
        </main>
      </main>

      <AppModal visible={isModalOpen} setVisible={closeModal} width="680px" title="设置">
        <section className="setup-modal">
          <article className="setup-modal-left">
            {setupItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleActiveSetupItems(item.id, index)}
                ref={(el) => (activeSetupItemRefs.current[item.id] = el)}>
                {item.name}
              </div>
            ))}
          </article>
          <article className="setup-modal-right">{setupItems[activeSetupItems.index].content}</article>
        </section>
      </AppModal>
    </Fragment>
  );
}

/**
 * @description 通用设置组件
 *  */
const GeneralSetUpComponent = ({}) => {
  // 设置列表项
  const [themes] = useState([
    { id: 1, name: "系统", theme: "system" },
    { id: 2, name: "白光", theme: "light" },
    { id: 3, name: "至夜", theme: "dark" },
  ]);

  const [activeTheme, setActiveTheme] = useState(
    () => JSON.parse(localStorage.getItem("theme")) || { id: 1, name: "系统", theme: "system" }
  );
  const activeThemeRefs = useRef([]);

  const handleActiveTheme = (id) => {
    if (activeTheme.id !== id) {
      if (activeThemeRefs.current[activeTheme.id]) {
        activeThemeRefs.current[activeTheme.id].style.background = "transparent";
      }

      if (activeThemeRefs.current[id]) {
        const theme = document.body.getAttribute("theme-mode");
        activeThemeRefs.current[id].style.background = theme === "light" ? "#dfdcdc" : "#124cd5cf";
      }
      const selectedTheme = themes.find((item) => item.id === id);
      setActiveTheme(selectedTheme);
    }
  };

  useEffect(() => {
    if (activeTheme.theme === "system") {
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.setAttribute("theme-mode", prefersDarkScheme ? "dark" : "light");
    } else {
      document.body.setAttribute("theme-mode", activeTheme.theme);
    }
    localStorage.setItem("theme", JSON.stringify(activeTheme));
  }, [activeTheme]);
  return (
    <Fragment>
      <section className="setup-modal-right-item">
        <div>主题</div>
        <AppPopover
          content={
            <article className="setup-modal-right-theme-content">
              {themes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleActiveTheme(item.id)}
                  ref={(el) => (activeThemeRefs.current[item.id] = el)}>
                  {item.name}
                </div>
              ))}
            </article>
          }
          modal=""
          trigger="click">
          <div className="setup-modal-right-theme">
            <span>{activeTheme.name}</span>
            <span>⌄</span>
          </div>
        </AppPopover>
      </section>
      <section className="setup-modal-right-item">
        <div>设置1</div>
      </section>
    </Fragment>
  );
};

/**
 * @description 数据管理
 *  */
const DataManageComponent = ({}) => {
  return (
    <Fragment>
      <section className="setup-modal-right-item">
        <div>数据管理内容</div>
      </section>
    </Fragment>
  );
};

/**
 * @description 语音
 *  */
const SpeechSoundComponent = ({}) => {
  return (
    <Fragment>
      <section className="setup-modal-right-item">
        <div>语音内容</div>
      </section>
    </Fragment>
  );
};

function AppPopover({ children, content, trigger, modal = "" }) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({});
  const appPopoverRef = useRef(null);
  const appContentRef = useRef(null);

  const togglePopover = (event) => {
    if (appPopoverRef.current && appPopoverRef.current.contains(event.target)) setVisible(true);
  }; // Click outside to close

  const handleClickOutside = (event) => {
    event.stopPropagation();
    if (appContentRef.current && !appContentRef.current.contains(event.target)) setVisible(false);
  };

  const adjustPosition = () => {
    if (!appPopoverRef.current || !appContentRef.current) return;

    const popoverRect = appPopoverRef.current.getBoundingClientRect();
    const contentRect = appContentRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const contentHorizontal = { left: "50%", transform: "translateX(-50%)" };
    const contentVertical = { top: "50%", transform: "translateY(-50%)" };

    let newStyle = { position: "absolute" }; // position: fixed;
    switch (modal) {
      case "top":
        newStyle = { ...newStyle, bottom: "100%", ...contentHorizontal };
        break;

      case "top-right-fixed":
        newStyle = { ...newStyle, bottom: "100%" };
        break;

      case "bottom":
        newStyle =
          popoverRect.bottom + contentRect.height > windowHeight
            ? { position: "absolute", bottom: "100%", ...contentHorizontal }
            : { position: "absolute", top: "100%", ...contentHorizontal };
        break;

      case "bottom-left":
        newStyle = { ...newStyle, transform: `translateX(-${contentRect.width}px)` };
        break;

      case "bottom-left-fixed":
        newStyle = { ...newStyle, transform: `translateX(-${contentRect.width - popoverRect.width}px)` };
        break;

      case "bottom-right":
        newStyle = { ...newStyle, transform: `translateX(${popoverRect.width}px)` };
        break;

      case "left":
        newStyle =
          popoverRect.left - contentRect.width < 0
            ? { ...newStyle, left: "100%", ...contentVertical }
            : { ...newStyle, right: "100%", ...contentVertical };
        break;

      case "right":
        newStyle =
          popoverRect.right + contentRect.width > windowWidth
            ? { ...newStyle, right: "100%", ...contentVertical }
            : { ...newStyle, left: "100%", ...contentVertical };
        break;

      default:
        newStyle = { ...newStyle, ...contentHorizontal };
    }
    setStyle(newStyle);
  };

  useEffect(() => {
    const handleResize = debounce(adjustPosition, 200);
    if (visible) {
      adjustPosition();
      document.body.style.overflowX = "hidden";
      window.addEventListener("resize", handleResize);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    } else {
      document.body.style.overflow = "auto";
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [visible]);

  return (
    <main className="app-popover" onClick={trigger === "click" ? togglePopover : undefined} ref={appPopoverRef}>
      {children}
      {visible && (
        <section style={style} className="app-popover-content" ref={appContentRef}>
          {content}
        </section>
      )}
    </main>
  );
}

function AppModal({ visible, setVisible, children, width, title = "" }) {
  const appModalContainerRef = useRef(null);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (visible) {
      if (!appModalContainerRef.current) return;

      const modalContentRect = appModalContainerRef.current.getBoundingClientRect();
      if (modalContentRect.height > window.innerHeight) appModalContainerRef.current.classList.toggle("adjust");

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => (document.body.style.overflow = "auto");
  }, [visible]);
  // if (!visible) return null;
  return (
    <div className={`app-modal ${visible ? "active" : ""}`} onClick={setVisible}>
      <div
        style={{ ...style, width }}
        className={`app-modal-container ${visible ? "active" : ""}`}
        onClick={(e) => e.stopPropagation()}
        ref={appModalContainerRef}>
        {title ? (
          <nav className="app-modal-nav">
            <div>{title}</div>
            <button className="app-modal-close-1" onClick={setVisible}>
              &times;
            </button>
          </nav>
        ) : (
          <button className="app-modal-close-2" onClick={setVisible}>
            &times;
          </button>
        )}
        <div className="app-modal-content">{children}</div>
      </div>
    </div>
  );
}

export default App;
