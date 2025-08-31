export type RootStackParamList = {
  Login: undefined;
  Success: { token: string };
  Home: undefined; 
  OrganisationDetail: { organisationId: string };
  BoardDetail: { boardId: string; boardName: string;}
  ListDetail: { listId: string; listName: string; boardId: string };
  CardDetail: { cardId: string; cardName: string };
};