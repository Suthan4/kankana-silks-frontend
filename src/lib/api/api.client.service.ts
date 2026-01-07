import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import { BaseApiService } from "./api.base.service";

class ClientApiService extends BaseApiService {
  constructor() {
    super(() => {
      authModalStore.openModal();
    }); // Redirect to client login on auth failure
  }
}

const clientApiService = new ClientApiService();
export default clientApiService;
