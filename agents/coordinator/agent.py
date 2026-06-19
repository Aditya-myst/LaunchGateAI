from shared.agent_factory import main_for
from shared.tools import tools_for_role

ROLE = "coordinator"
DISPLAY = "LaunchGate Coordinator"

if __name__ == "__main__":
    main_for(ROLE, tools_for_role(ROLE, DISPLAY))
