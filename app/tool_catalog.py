from dataclasses import dataclass
from importlib.util import find_spec
from shutil import which


@dataclass(frozen=True)
class ToolDefinition:
    key: str
    category_label: str
    tool_name: str
    summary: str
    docs_url: str
    install_hint: str
    availability_kind: str
    availability_target: str


TOOL_DEFINITIONS: dict[str, ToolDefinition] = {
    "unit": ToolDefinition(
        key="unit",
        category_label="单元测试",
        tool_name="pytest",
        summary="对金融领域的计算规则、校验逻辑和组件函数做快速回归。",
        docs_url="https://docs.pytest.org/en/stable/how-to/mark.html",
        install_hint="pip install pytest",
        availability_kind="module",
        availability_target="pytest",
    ),
    "integration": ToolDefinition(
        key="integration",
        category_label="集成测试",
        tool_name="pytest + httpx",
        summary="验证登录、行情、持仓、转账等金融路径与后端接口的联通情况。",
        docs_url="https://docs.pytest.org/en/stable/how-to/mark.html",
        install_hint="pip install pytest",
        availability_kind="module",
        availability_target="pytest",
    ),
    "functional": ToolDefinition(
        key="functional",
        category_label="功能测试",
        tool_name="Playwright",
        summary="对 Web 页面做真实浏览器交互测试，覆盖登录、行情、交易和账户流程。",
        docs_url="https://playwright.dev/python/docs/intro",
        install_hint="pip install playwright && python -m playwright install chromium",
        availability_kind="module",
        availability_target="playwright",
    ),
    "stability": ToolDefinition(
        key="stability",
        category_label="稳定性测试",
        tool_name="Locust",
        summary="用并发用户模拟金融站点访问压力，观察页面路径在长压下的稳定性。",
        docs_url="https://docs.locust.io/en/latest/running-without-web-ui.html",
        install_hint="pip install locust",
        availability_kind="binary",
        availability_target="locust",
    ),
    "security": ToolDefinition(
        key="security",
        category_label="安全测试",
        tool_name="OWASP ZAP Baseline",
        summary="对金融 Web 页面做基线安全扫描，发现被动安全告警和头部配置问题。",
        docs_url="https://www.zaproxy.org/docs/docker/baseline-scan/",
        install_hint="docker pull ghcr.io/zaproxy/zaproxy:stable",
        availability_kind="binary",
        availability_target="docker",
    ),
}

ALL_WEB_TEST_KINDS = tuple(TOOL_DEFINITIONS.keys())


def is_tool_available(definition: ToolDefinition) -> bool:
    if definition.availability_kind == "module":
        return find_spec(definition.availability_target) is not None
    return which(definition.availability_target) is not None


def list_tool_catalog() -> list[dict[str, str | bool]]:
    return [
        {
            "key": definition.key,
            "category_label": definition.category_label,
            "tool_name": definition.tool_name,
            "summary": definition.summary,
            "docs_url": definition.docs_url,
            "install_hint": definition.install_hint,
            "installed": is_tool_available(definition),
        }
        for definition in TOOL_DEFINITIONS.values()
    ]
