import {get} from '@/utils/fetch';

export function getCurrentAreaInfo (parmas) {
  const { id, table, DB } = parmas;
  return get(`/geom/getCurrentAreaInfo/${id}/${table}/${DB}`);
}

export function setStatus (parmas) {
  const { id, status, DB } = parmas;
  return get(`/geom/setStatus/${id}/${status}/${DB}`);
}
