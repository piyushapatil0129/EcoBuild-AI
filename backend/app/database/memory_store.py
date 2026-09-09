"""
In-Memory Async Document Store for EcoBuild AI.
Provides a transparent PyMongo / Motor async interface for local testing,
offline mode, or before MongoDB Atlas credentials are provided in .env.
"""
import uuid
import copy
from datetime import datetime
from typing import Dict, Any, List, Optional

class AsyncCursor:
    def __init__(self, docs: List[Dict[str, Any]], sort_key: str = None, reverse: bool = False):
        self._docs = docs
        if sort_key:
            self._docs = sorted(self._docs, key=lambda x: x.get(sort_key, ""), reverse=reverse)
        self._index = 0

    def sort(self, key: str, direction: int = 1):
        self._docs = sorted(self._docs, key=lambda x: x.get(key, ""), reverse=(direction < 0))
        return self

    def limit(self, count: int):
        self._docs = self._docs[:count]
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._index < len(self._docs):
            doc = self._docs[self._index]
            self._index += 1
            return copy.deepcopy(doc)
        raise StopAsyncIteration

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return copy.deepcopy(self._docs[:length])
        return copy.deepcopy(self._docs)

class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self._data: Dict[str, Dict[str, Any]] = {}

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "_id":
                if str(doc.get("_id")) != str(v):
                    return False
            elif isinstance(v, dict):
                # Handle simple operators like $in
                if "$in" in v and doc.get(k) not in v["$in"]:
                    return False
            elif doc.get(k) != v:
                return False
        return True

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self._data.values():
            if self._matches(doc, query):
                return copy.deepcopy(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> AsyncCursor:
        query = query or {}
        matches = [d for d in self._data.values() if self._matches(d, query)]
        return AsyncCursor(matches)

    async def insert_one(self, document: Dict[str, Any]):
        doc = copy.deepcopy(document)
        doc_id = str(doc.get("_id") or uuid.uuid4())
        doc["_id"] = doc_id
        if "createdAt" not in doc:
            doc["createdAt"] = datetime.utcnow().isoformat()
        self._data[doc_id] = doc
        
        class InsertResult:
            inserted_id = doc_id
        return InsertResult()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        doc = await self.find_one(query)
        if not doc:
            class UpdateResult:
                matched_count = 0
                modified_count = 0
            return UpdateResult()
            
        doc_id = doc["_id"]
        if "$set" in update:
            self._data[doc_id].update(update["$set"])
        else:
            self._data[doc_id].update(update)
        self._data[doc_id]["updatedAt"] = datetime.utcnow().isoformat()
        
        class UpdateResult:
            matched_count = 1
            modified_count = 1
        return UpdateResult()

    async def delete_one(self, query: Dict[str, Any]):
        doc = await self.find_one(query)
        if doc:
            doc_id = doc["_id"]
            if doc_id in self._data:
                del self._data[doc_id]
            class DeleteResult:
                deleted_count = 1
            return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return sum(1 for d in self._data.values() if self._matches(d, query))

class MockDatabase:
    def __init__(self, db_name: str = "ecobuild_db"):
        self.name = db_name
        self.collections: Dict[str, MockCollection] = {}

    def __getitem__(self, collection_name: str) -> MockCollection:
        if collection_name not in self.collections:
            self.collections[collection_name] = MockCollection(collection_name)
        return self.collections[collection_name]

    def get_collection(self, collection_name: str) -> MockCollection:
        return self[collection_name]
