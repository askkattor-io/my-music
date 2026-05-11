import * as z from "zod";

export const CreatePlaylistSchema = z.object({
  name: z.string(),
});

export const AddSongSchema = z.object({
  song_id: z.string(),
});

export type CreatePlaylistType = [
  id: string,
  user_id: string,
  name: string,
  created_at: number,
];

export type CreatePlaylistSongType = [
  playlist_id: string,
  song_id: string,
  position: number,
  added_at: number,
];

export type GetPlaylistsByUserIdType = [id: string];

export type GetPlaylistsByUserIdReturnType = { id: string; name: string };

export type GetPlaylistByIdType = [id: string];

export type GetPlaylistByIdReturnType = {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
};

export type GetAllSongsInPlaylistType = [playlist_id: string];

export type GetAllSongsInPlaylistReturnType = {
  song_id: string;
  position: number;
};
