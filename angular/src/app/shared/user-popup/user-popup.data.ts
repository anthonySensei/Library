import { User } from '../../models/user.model';

export interface UserPopupData {
    isEdit?: boolean;
    user?: User;
}
