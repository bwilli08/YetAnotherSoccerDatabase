import Client from "../Client";

export var clubs = [];
Client.club_search(result => clubs = result);

export var prediction_seasons = [];
Client.get_seasons(result => prediction_seasons = result);

export function find_club_by_id(id) {
    for (var i = 0; i < clubs.length; i++) {
        if (clubs[i].id === id) {
            return clubs[i];
        }
    }

    return null;
}