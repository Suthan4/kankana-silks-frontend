import { authModalStore } from "@/store/useAuthModalStore";
import { BaseApiService } from "./api.base.service";

class ClientApiService extends BaseApiService {
  constructor() {
    super(() => {
      const {user} = authModalStore.getState();
        // ✅ Only open modal if NOT logged in
      if (!user) {
        authModalStore.getState().openModal();
      }
    }); // Redirect to client login on auth failure
    
  }
}

const clientApiService = new ClientApiService();
export default clientApiService;
