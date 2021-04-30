import { User } from '../../models/user.model';

export interface UserPopupData {
    isLibrarian?: boolean;
    isEdit?: boolean;
    user?: User;
}
