from shared.agent_factory import main_for
from shared.tools import tools_for_role

ROLE = "engineering"
DISPLAY = "Engineering Readiness"

if __name__ == "__main__":
    main_for(ROLE, tools_for_role(ROLE, DISPLAY))
