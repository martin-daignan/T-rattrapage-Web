import {useEffect, useState } from "react";
  import {useParams,useNavigate  } from "react-router-dom";
  import {DndContext,closestCenter,KeyboardSensor,PointerSensor,useSensor,useSensors,type DragEndEvent,type DragStartEvent,DragOverlay,} from '@dnd-kit/core';
  import {arrayMove,SortableContext,horizontalListSortingStrategy, useSortable,verticalListSortingStrategy,} from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';
  import { getLists, createList, updateList, archiveList } from "../services/listAPI";
  import { getCard, createCard, deleteCard, moveCard, updateCard } from "../services/cardsAPI";

  interface List {
    id: string;
    name: string;
    pos: number;
    closed: boolean;
  }

  interface Card {
    id: string;
    name: string;
    desc?: string;
    idList: string;
    pos: number;
  }
  export default function ListScreen() {
    const { boardId } = useParams<{ boardId: string }>();
    const [lists, setLists] = useState<List[]>([]);
    const [cards, setCards] = useState<{ [listId: string]: Card[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<'list' | 'card' | null>(null);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [currentList, setCurrentList] = useState<List | null>(null);
    const [currentListForCard, setCurrentListForCard] = useState<string | null>(null);
    const [listName, setListName] = useState("");
    const [cardName, setCardName] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const sensors = useSensors(useSensor(PointerSensor),useSensor(KeyboardSensor) );

    useEffect(() => {
      if (boardId) {
        fetchLists();
      }
    }, [boardId]);

    const fetchLists = async () => {
      if (!boardId) return setError("Board ID manquant");

      try {
        setLoading(true);
        const data = await getLists(boardId);
        const activeLists = data.filter((list: List) => !list.closed);
        const sortedLists = activeLists.sort((a: List, b: List) => a.pos - b.pos);
        setLists(sortedLists);
        
        await fetchCardsForLists(sortedLists);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Erreur de récupération des listes");
      } finally {
        setLoading(false);
      }
    };

    const fetchCardsForLists = async (lists: List[]) => {
      const cardsData: { [listId: string]: Card[] } = {};
      
      for (const list of lists) {
        try {
          const cards = await getCard(list.id);
          const sortedCards = cards.sort((a: Card, b: Card) => a.pos - b.pos);
          cardsData[list.id] = sortedCards;
        } catch (err) {
          console.warn(`Impossible de charger les cartes pour la liste ${list.id}:`, err);
          cardsData[list.id] = [];
        }
      }
      
      setCards(cardsData);
    };

    const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);
      
      const isList = lists.some(list => list.id === active.id);
      setActiveType(isList ? 'list' : 'card');
    };

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveType(null);

      if (!over) return;
      if (active.id === over.id) return;


      // Déplacement de carte
      const sourceListId = Object.keys(cards).find(listId => 
        cards[listId].some(card => card.id === active.id)
      );
      
      const targetListId = Object.keys(cards).find(listId => 
        cards[listId].some(card => card.id === over.id)
      ) || over.id;

      if (!sourceListId || !targetListId) return;

      // Même liste
      if (sourceListId === targetListId) {
        const listCards = cards[sourceListId] || [];
        const oldIndex = listCards.findIndex(card => card.id === active.id);
        const newIndex = listCards.findIndex(card => card.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newCards = arrayMove(listCards, oldIndex, newIndex);
          setCards({
            ...cards,
            [sourceListId]: newCards
          });

          try {
            await updateCard(active.id as string, { pos: newIndex });
          } catch (err) {
            console.error("Erreur déplacement carte:", err);
            fetchLists();
          }
        }
      } 
      else {
        const sourceCards = cards[sourceListId] || [];
        const targetCards = cards[targetListId] || [];
        
        const oldIndex = sourceCards.findIndex(card => card.id === active.id);
        const newIndex = targetCards.findIndex(card => card.id === over.id);

        if (oldIndex !== -1) {
          const [movedCard] = sourceCards.splice(oldIndex, 1);
          const updatedCard = { ...movedCard, idList: targetListId };
          
          const newTargetIndex = newIndex === -1 ? targetCards.length : newIndex;
          targetCards.splice(newTargetIndex, 0, updatedCard);

          setCards({
            ...cards,
            [sourceListId]: sourceCards,
            [targetListId]: targetCards
          });

          try {
            await moveCard(active.id as string, targetListId);
            await updateCard(active.id as string, { pos: newTargetIndex });
          } catch (err) {
            console.error("Erreur déplacement carte entre listes:", err);
            fetchLists();
          }
        }
      }
    };

    const handleCreateList = async () => {
      if (!listName.trim() || !boardId) return;
      
      try {
        setActionLoading(true);
        await createList(boardId, listName.trim());
        setListName("");
        setShowCreateModal(false);
        await fetchLists();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la création de la liste");
      } finally {
        setActionLoading(false);
      }
    };

    const handleCreateCard = async () => {
      if (!cardName.trim() || !currentListForCard) return;
      
      try {
        setActionLoading(true);
        await createCard(currentListForCard, cardName.trim());
        setCardName("");
        setShowCardModal(false);
        setCurrentListForCard(null);
        await fetchLists();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la création de la carte");
      } finally {
        setActionLoading(false);
      }
    };

    const handleUpdateList = async () => {
      if (!listName.trim() || !currentList) return;
      
      try {
        setActionLoading(true);
        await updateList(currentList.id, listName.trim());
        setListName("");
        setShowEditModal(false);
        setCurrentList(null);
        await fetchLists();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la modification de la liste");
      } finally {
        setActionLoading(false);
      }
    };

    const handleArchiveList = async (listId: string) => {
      if (!window.confirm("Êtes-vous sûr de vouloir archiver cette liste ?")) return;
      
      try {
        setActionLoading(true);
        await archiveList(listId);
        await fetchLists();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'archivage de la liste");
      } finally {
        setActionLoading(false);
      }
    };

    const handleDeleteCard = async (cardId: string) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return;
      
      try {
        setActionLoading(true);
        await deleteCard(cardId);
        await fetchLists();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression de la carte");
      } finally {
        setActionLoading(false);
      }
    };

    const openEditModal = (list: List) => {
      setCurrentList(list);
      setListName(list.name);
      setShowEditModal(true);
    };

    const openCardModal = (listId: string) => {
      setCurrentListForCard(listId);
      setShowCardModal(true);
    };

    const closeModals = () => {
      setShowCreateModal(false);
      setShowEditModal(false);
      setShowCardModal(false);
      setCurrentList(null);
      setCurrentListForCard(null);
      setListName("");
      setCardName("");
    };

    const getActiveItem = () => {
      if (!activeId) return null;
      
      if (activeType === 'list') {
        return lists.find(list => list.id === activeId);
      } else {
        for (const listId in cards) {
          const card = cards[listId].find(c => c.id === activeId);
          if (card) return card;
        }
      }
      return null;
    };
const SortableList = ({ list, onEdit, onArchive, children, isDragging }: { 
    list: List; 
    onEdit: () => void; 
    onArchive: () => void;
    children: React.ReactNode;
    isDragging?: boolean;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: list.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          flex: "0 0 18rem",
          width: "18rem",
          background: isDragging ? "#e5e7eb" : "#f3f4f6",
          borderRadius: "8px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
        }}
      >
        <div 
          {...attributes}
          {...listeners}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "12px",
            cursor: "grab"
          }}
        >
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#374151" }}>
            {list.name}
          </h3>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={onEdit}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
              title="Modifier la liste"
            >
              ✏️
            </button>
            <button
              onClick={onArchive}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
              title="Archiver la liste"
            >
              🗑️
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  };

  const SortableCard = ({ card, onDelete, isDragging }: { 
    card: Card; 
    onDelete: () => void;
    isDragging?: boolean;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: card.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          ...style,
          background: isDragging ? "#f9fafb" : "#fff",
          padding: "10px",
          borderRadius: "6px",
          boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 0 rgba(0,0,0,0.04)",
          border: "1px solid #e5e7eb",
          cursor: "grab",
        }}
      >
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#374151" }}>
          {card.name}
        </p>
        {card.desc && (
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#6b7280" }}>
            {card.desc}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "end", marginTop: "8px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              fontSize: "12px",
              color: "#f87171"
            }}
            title="Supprimer la carte"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };
    if (loading) return <div className="p-8">Chargement des listes...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
        </div>
           {/* Bouton de retour */}
          <button
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            title="Retour aux boards"
            disabled={actionLoading}
          ></button>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "flex-start",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "1rem",
                width: "100%",
                minHeight: "500px"
              }}
            >
              {lists.map((list) => (
                <SortableList
                  key={list.id}
                  list={list}
                  onEdit={() => openEditModal(list)}
                  onArchive={() => handleArchiveList(list.id)}
                  isDragging={activeId === list.id}
                >
                  <SortableContext items={(cards[list.id] || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ 
                      overflowY: "auto", 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "8px",
                      maxHeight: "65vh",
                      minHeight: "50px",
                      padding: "4px"
                    }}>
                      {(cards[list.id] || []).map((card) => (
                        <SortableCard
                          key={card.id}
                          card={card}
                          onDelete={() => handleDeleteCard(card.id)}
                          isDragging={activeId === card.id}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <button 
                    onClick={() => openCardModal(list.id)}
                    style={{ 
                      marginTop: "12px", 
                      textAlign: "left", 
                      background: "none",
                      border: "none",
                      padding: "8px",
                      borderRadius: "4px",
                      color: "#4b5563",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                    disabled={actionLoading}
                  >
                    <span style={{ marginRight: "4px" }}>+</span> Ajouter une carte
                  </button>
                </SortableList>
              ))}

              <div style={{ flex: "0 0 18rem", width: "18rem" }}>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  style={{ 
                    width: "100%", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    background: "#e5e7eb",
                    border: "none",
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    height: "48px"
                  }}
                  disabled={actionLoading}
                >
                  + Ajouter une autre liste
                </button>
              </div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && activeType === 'list' ? (
              <div style={{
                width: "18rem",
                background: "#e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                opacity: 0.8
              }}>
                {getActiveItem()?.name}
              </div>
            ) : activeId && activeType === 'card' ? (
              <div style={{
                background: "#f9fafb",
                padding: "10px",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
                opacity: 0.8
              }}>
                {getActiveItem()?.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Modals */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Créer une liste</h2>
              <input
                type="text"
                placeholder="Nom de la liste"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={closeModals} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Annuler
                </button>
                <button
                  onClick={handleCreateList}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={actionLoading || !listName.trim()}
                >
                  {actionLoading ? "Création..." : "Créer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Ajouter une carte</h2>
              <input
                type="text"
                placeholder="Nom de la carte"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCard()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={closeModals} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Annuler
                </button>
                <button
                  onClick={handleCreateCard}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={actionLoading || !cardName.trim()}
                >
                  {actionLoading ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && currentList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Modifier la liste</h2>
              <input
                type="text"
                placeholder="Nom de la liste"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateList()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={closeModals} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Annuler
                </button>
                <button
                  onClick={handleUpdateList}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                  disabled={actionLoading || !listName.trim()}
                >
                  {actionLoading ? "Modification..." : "Modifier"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } 